// src/pages/ticket/TicketDetails.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  User,
  CheckCircle,
  Clock,
  RefreshCcw,
  Hash,
  ArrowRight,
  Send,
  Paperclip,
  Copy,
  FileText,
  X,
  Layers,
  Mail,
  ExternalLink,
  Download,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '../../services/api';

// --- Constants ---
const FILE_BASE_URL = 'https://dev.backend.mobo.land/api/v1/portal/ticket/image/download?imageFile=';

// --- Components: Mobo Logo (Cat Planet SVG) ---
const MoboLogo = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="moboGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" /> {/* Purple */}
        <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
      </linearGradient>
    </defs>
    <path 
      d="M20 35 C 20 20, 35 15, 50 15 C 65 15, 80 20, 80 35 L 90 20 L 85 45 C 90 55, 90 65, 85 75 C 80 90, 65 95, 50 95 C 35 95, 20 90, 15 75 C 10 65, 10 55, 15 45 L 10 20 L 20 35 Z" 
      fill="url(#moboGradient)" 
    />
    <path 
      d="M10 65 Q 50 90 90 55" 
      stroke="white" 
      strokeWidth="6" 
      strokeLinecap="round"
      opacity="0.8"
    />
    <circle cx="35" cy="50" r="5" fill="white" opacity="0.9" />
    <circle cx="65" cy="50" r="5" fill="white" opacity="0.9" />
  </svg>
);

// --- Interfaces ---

interface UserData {
  _id: string;
  name: string;
  family: string;
  email: string;
  mobile: string;
  role?: string;
  username?: string;
}

interface Message {
  _id: string;
  sender: 'user' | 'admin' | 'support' | string;
  text: string;
  createdAt: string;
  files?: string[];
  file?: string;
}

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'waiting-response' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  userId: UserData;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [replyText, setReplyText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  // --- Helpers ---
  const formatDate = (isoString: string) => {
    if (!isoString) return { date: '-', time: '-' };
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('fa-IR'),
      time: date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('کپی شد', { position: 'bottom-center', autoClose: 1000 });
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getFileUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('https')) return path;
    return `${FILE_BASE_URL}${path}`;
  };

  const isImageFile = (path: string) => {
      if (!path) return false;
      const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
      const ext = path.split('.').pop()?.toLowerCase();
      return ext ? extensions.includes(ext) : false;
  };

  const getAllAttachments = () => {
    if (!ticket || !ticket.messages) return [];
    let allFiles: { originalPath: string; fullUrl: string; date: string; sender: string }[] = [];
    ticket.messages.forEach(msg => {
      const msgFiles = [];
      if (msg.files && msg.files.length > 0) msgFiles.push(...msg.files);
      if (msg.file) msgFiles.push(msg.file);
      msgFiles.forEach(f => {
        allFiles.push({
          originalPath: f,
          fullUrl: getFileUrl(f),
          date: msg.createdAt,
          sender: msg.sender
        });
      });
    });
    return allFiles.reverse();
  };

  // --- Fetch Data ---
  const fetchDetails = async () => {
    if (!id) return;
    try {
      const response = await api.get(`/ticket/details?_id=${id}`);
      if (response.data) {
         const ticketData = response.data.ticket || response.data.result || response.data;
         setTicket(ticketData);
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast.error('خطا در دریافت اطلاعات تیکت');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (ticket) scrollToBottom();
  }, [ticket]);

  // --- File Handling ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Send Reply ---
  const handleSendReply = async () => {
    if (!replyText.trim() && !selectedFile) {
      toast.warning('لطفا متن پاسخ یا یک فایل را وارد کنید.');
      return;
    }

    try {
      setSending(true);
      let uploadedFilePath = "";

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadResponse = await api.post('/ticket/file/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        const resData = uploadResponse.data;
        if (typeof resData === 'string') uploadedFilePath = resData;
        else if (resData?.file?.fileAddress) uploadedFilePath = resData.file.fileAddress;
        else if (resData?.fileAddress) uploadedFilePath = resData.fileAddress;
        else if (resData?.url) uploadedFilePath = resData.url;
        else if (resData?.file && typeof resData.file === 'object') uploadedFilePath = Object.values(resData.file)[0] as string || "";
      }

      const payload = {
        ticketId: id,
        message: replyText, 
        file: uploadedFilePath 
      };

      await api.put('/ticket/response', payload);
      toast.success('پاسخ شما با موفقیت ارسال شد.');
      setReplyText('');
      removeSelectedFile();
      await fetchDetails(); 
    } catch (error: any) {
      console.error('Error sending reply:', error);
      const serverMsg = error.response?.data?.message || 'خطا در ارسال پاسخ.';
      toast.error(serverMsg);
    } finally {
      setSending(false);
    }
  };

  // --- UI Helpers ---
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'done': return { label: 'بسته شده', bg: '#ecfdf5', color: '#10b981', icon: CheckCircle };
      case 'waiting-response': return { label: 'در انتظار پاسخ', bg: '#fffbeb', color: '#f59e0b', icon: Clock };
      case 'pending': return { label: 'در حال بررسی', bg: '#eff6ff', color: '#3b82f6', icon: RefreshCcw };
      case 'open': return { label: 'باز', bg: '#fef2f2', color: '#ef4444', icon: AlertCircle };
      default: return { label: status, bg: '#f3f4f6', color: '#6b7280', icon: Hash };
    }
  };

  const getPriorityInfo = (priority: string) => {
      switch(priority) {
          case 'critical': return { label: 'بحرانی', color: '#be123c', bg: '#ffe4e6' };
          case 'high': return { label: 'بالا', color: '#b45309', bg: '#fef3c7' };
          case 'medium': return { label: 'متوسط', color: '#0369a1', bg: '#e0f2fe' };
          default: return { label: 'پایین', color: '#374151', bg: '#f3f4f6' };
      }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-secondary" role="status"></div>
      </div>
    );
  }

  if (!ticket) return <div className="text-center mt-5">تیکت یافت نشد.</div>;

  const statusInfo = getStatusInfo(ticket.status);
  const priorityInfo = getPriorityInfo(ticket.priority);
  const attachments = getAllAttachments();
  const mainTicketDate = formatDate(ticket.createdAt);

  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: '1400px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      
      {/* --- Header --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
           <div className="d-flex align-items-center gap-3 mb-1">
             <button onClick={() => navigate(-1)} className="btn btn-sm btn-light border rounded-circle p-2 shadow-sm d-lg-none">
                <ArrowRight size={18}/>
             </button>
             <h4 className="fw-bold text-dark mb-0">{ticket.title}</h4>
           </div>
           <span className="text-muted small dir-ltr">Ticket ID: {ticket._id}</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-white bg-white border shadow-sm rounded-pill px-4 d-none d-lg-flex align-items-center gap-2 hover-lift text-muted"
        >
          <ArrowRight size={18} />
          <span>بازگشت</span>
        </button>
      </div>

      <div className="row g-4">
        
        {/* --- LEFT COLUMN: Chat Area --- */}
        <div className="col-lg-8 d-flex flex-column gap-4">
          
          {/* Main Description (User's First Message - REDESIGNED) */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden position-relative bg-white">
             {/* Decorative Top Line */}
             <div style={{ height: '4px', background: 'linear-gradient(90deg, #a855f7, #3b82f6)' }} className="w-100"></div>
             
             <div className="card-body p-4">
                {/* Header Section */}
                <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
                   {/* User Info */}
                   <div className="d-flex align-items-center gap-3">
                      {/* Avatar with Gradient Ring */}
                      <div className="p-1 rounded-circle d-flex align-items-center justify-content-center" 
                           style={{ background: 'linear-gradient(135deg, #e0e7ff, #f3e8ff)' }}>
                         <div className="bg-white rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold" 
                              style={{ width: 48, height: 48, fontSize: '1.2rem' }}>
                            {ticket.userId?.name?.[0]?.toUpperCase() || <User size={24}/>}
                         </div>
                      </div>
                      
                      <div>
                         <h6 className="mb-1 fw-bold text-dark fs-5">
                            {ticket.userId?.name} {ticket.userId?.family}
                         </h6>
                         <div className="d-flex align-items-center gap-2 text-muted small">
                            <Clock size={14} className="text-secondary opacity-75"/>
                            <span className="dir-ltr">{mainTicketDate.date}</span>
                            <span className="opacity-50">•</span>
                            <span>{mainTicketDate.time}</span>
                         </div>
                      </div>
                   </div>

                   {/* Badge */}
                   <div className="ms-auto ms-sm-0">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 d-flex align-items-center gap-2 shadow-sm">
                         <Hash size={14} />
                         <span>تیکت اصلی</span>
                      </span>
                   </div>
                </div>

                {/* Content Box */}
                {/* <div className="bg-gray-50 p-4 rounded-4 position-relative border border-light">
                   {/* Background Quote Icon */}
                   {/* <div className="position-absolute top-0 start-0 p-3 opacity-10 text-secondary pointer-events-none">
                      <Quote size={32} />
                   </div>
                    */}
                   {/* <p className="mb-0 text-dark leading-loose position-relative" style={{ zIndex: 1, whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                     {ticket.description}
                   </p> */}
                {/* </div> */}
             </div>
          </div>

          {/* Messages Loop */}
          <div className="d-flex flex-column gap-3 pb-3">
             {ticket.messages?.map((msg, index) => {
               const isCustomer = msg.sender === 'user'; 
               const msgDate = formatDate(msg.createdAt);
               const msgFiles = msg.files && msg.files.length > 0 ? msg.files : (msg.file ? [msg.file] : []);

               return (
                 <div 
                   key={msg._id || index} 
                   className={`d-flex w-100 ${isCustomer ? 'justify-content-end' : 'justify-content-start'}`}
                 >
                    
                    {/* Customer Avatar (Shown on Left side) */}
                    {isCustomer && (
                       <div className="me-2 d-flex flex-column justify-content-end order-2">
                          <div className="rounded-circle bg-gray-200 text-secondary d-flex align-items-center justify-content-center shadow-sm" style={{width: 38, height: 38}}>
                             <User size={20} />
                          </div>
                       </div>
                    )}

                    {/* Support Avatar (Shown on Right side) */}
                    {!isCustomer && (
                       <div className="ms-2 d-flex flex-column justify-content-end order-1">
                          <div className="rounded-circle bg-white border d-flex align-items-center justify-content-center shadow-sm p-1" style={{width: 42, height: 42}}>
                             <MoboLogo size={32} />
                          </div>
                       </div>
                    )}

                    {/* Message Bubble */}
                    <div 
                      className={`p-3 position-relative shadow-sm d-flex flex-column ${isCustomer ? 'order-1' : 'order-2'}`}
                      style={{ 
                        maxWidth: '85%',
                        height: 'fit-content',
                        borderRadius: '20px',
                        borderBottomLeftRadius: isCustomer ? '4px' : '20px',
                        borderBottomRightRadius: isCustomer ? '20px' : '4px',
                        background: isCustomer ? '#ffffff' : 'linear-gradient(135deg, #8b5cf6 23%, #3b82f6 100%)', 
                        color: isCustomer ? '#1f2937' : '#ffffff',
                        border: isCustomer ? '1px solid #e5e7eb' : 'none',
                      }}
                    >
                       {/* Header: Name & Time */}
                       <div className="d-flex justify-content-between align-items-center mb-2 gap-4">
                          <span className={`small fw-bold ${isCustomer ? 'text-dark' : 'text-white'}`}>
                             {isCustomer ? `${ticket.userId?.name}` : 'پشتیبانی'}
                          </span>
                          <span className={`${isCustomer ? 'text-muted' : 'text-white-50'}`} style={{fontSize: '0.7rem'}}>
                            {msgDate.time}
                          </span>
                       </div>
                       
                       {/* Text Content */}
                       {msg.text && <p className="mb-2 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>}
                       
                       {/* Files inside message */}
                       {msgFiles.length > 0 && (
                         <div className={`mt-1 pt-2 ${isCustomer ? 'border-top' : 'border-top border-white border-opacity-25'}`}>
                           {msgFiles.map((rawPath, i) => {
                             const fullUrl = getFileUrl(rawPath);
                             const isImg = isImageFile(rawPath);
                             return (
                               <a 
                                 key={i} 
                                 href={fullUrl} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 className={`d-flex align-items-center gap-2 p-2 rounded text-decoration-none small mb-1 ${isCustomer ? 'bg-light text-dark hover-bg-gray' : 'bg-white bg-opacity-10 text-white hover-bg-white-20'}`}
                                 style={{ width: 'fit-content' }}
                               >
                                  {isImg ? <ImageIcon size={16} /> : <FileText size={16} />}
                                  <span className="text-truncate dir-ltr" style={{maxWidth: '200px'}}>
                                    {isImg ? 'مشاهده تصویر' : 'دانلود فایل'}
                                  </span>
                               </a>
                             );
                           })}
                         </div>
                       )}
                    </div>
                 </div>
               );
             })}
             <div ref={chatEndRef} />
          </div>

          {/* Reply Area (Green Button) */}
          <div className="card border-0 shadow-sm rounded-4 mt-auto">
            <div className="card-body p-3 bg-white">
               {selectedFile && (
                 <div className="mb-3 d-flex align-items-center justify-content-between bg-light border rounded-3 p-2">
                    <div className="d-flex align-items-center gap-2">
                       <FileText size={20} className="text-primary" />
                       <span className="d-block text-dark small fw-bold text-truncate" style={{maxWidth: '250px'}}>{selectedFile.name}</span>
                    </div>
                    <button onClick={removeSelectedFile} className="btn btn-sm text-danger hover-bg-danger rounded-circle p-1">
                       <X size={18} />
                    </button>
                 </div>
               )}

               <textarea 
                  className="form-control border bg-light shadow-none rounded-3 p-3 mb-3 focus-ring"
                  rows={4}
                  placeholder="پاسخ پشتیبان را اینجا بنویسید..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ resize: 'none', fontSize: '0.95rem' }}
                  disabled={sending}
               ></textarea>
               
               <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-2">
                    <input type="file" ref={fileInputRef} className="d-none" onChange={handleFileSelect} />
                    <button 
                      className="btn btn-light btn-sm text-secondary rounded-pill px-3 d-flex align-items-center gap-1 border hover-bg-gray"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending}
                    >
                      <Paperclip size={16} />
                      <span className="small">پیوست</span>
                    </button>
                  </div>

                  <button 
                    className={`btn rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm text-white ${sending ? 'disabled' : ''}`}
                    onClick={handleSendReply}
                    disabled={sending}
                    style={{ 
                        background: 'linear-gradient(to right, #10b981, #059669)', // Green Gradient
                        border: 'none'
                    }}
                  >
                    {sending ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span>ارسال...</span>
                        </>
                    ) : (
                        <>
                            <span>ارسال پاسخ</span>
                            <Send size={16} />
                        </>
                    )}
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Sidebar --- */}
        <div className="col-lg-4">
          <div className="sticky-top d-flex flex-column gap-3" style={{ top: '20px' }}>
            
            {/* 1. Status & Priority Card (With Purple Accent) */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
               <div className="card-header border-0 py-3 d-flex align-items-center gap-2" 
                    style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #e0f2fe 100%)' }}> 
                   <MoboLogo size={20} />
                   <span className="fw-bold" style={{ color: '#6d28d9' }}>اطلاعات تیکت</span>
               </div>
              <div className="card-body p-4">
                 
                 <div className="d-flex align-items-center justify-content-between mb-3">
                     <span className="text-muted fw-bold small">وضعیت فعلی</span>
                     <span 
                        className="px-3 py-1 rounded-pill small fw-bold d-flex align-items-center gap-1 "
                        style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                     >
                         <span>#{statusInfo.label}</span>
                         {}
                         <statusInfo.icon size={14} />
                     </span>
                 </div>

                 <hr className="border-secondary opacity-10 my-3" />
                 
                 <div className="d-flex align-items-center justify-content-between">
                    <div className="text-center">
                        <span className="d-block text-muted small mb-1">دپارتمان</span>
                        <div className="d-flex align-items-center gap-1 text-dark fw-bold justify-content-center">
                            <Layers size={16} className="text-muted"/>
                            <span>{ticket.department || 'عمومی'}</span>
                        </div>
                    </div>
                    <div className="text-center">
                       <span className="d-block text-muted small mb-1">اولویت</span>
                       <span 
                         className="px-3 py-1 rounded-pill fw-bold small border d-inline-block"
                         style={{ backgroundColor: priorityInfo.bg, color: priorityInfo.color }} 
                       >
                         {priorityInfo.label}
                       </span>
                    </div>
                 </div>
              </div>
            </div>

            {/* 2. User Info Card */}
            <div className="card border-0 shadow-sm rounded-4">
               <div className="card-body p-4">
                  <h6 className="mb-4 fw-bold text-muted small d-flex align-items-center gap-2">
                    <User size={16} />
                    اطلاعات کاربر
                  </h6>
                  
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center border" style={{width: 56, height: 56}}>
                       <span className="fw-bold fs-4">{ticket.userId?.name?.[0] || 'U'}</span>
                    </div>
                    <div className="overflow-hidden">
                      <h6 className="mb-1 text-truncate fw-bold text-dark">{ticket.userId?.name} {ticket.userId?.family}</h6>
                      <span className="text-muted small d-block dir-ltr text-end w-100 font-monospace">
                        {ticket.userId?.mobile || '---'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-light rounded-4 p-3 border border-light mb-3">
                     <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small d-flex align-items-center gap-1">
                            <Mail size={14}/> ایمیل:
                        </span>
                        <span className="dir-ltr text-dark small fw-medium text-truncate" style={{maxWidth: '140px'}}>
                           {ticket.userId?.email || '-'}
                        </span>
                     </div>
                     <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small d-flex align-items-center gap-1">
                            <Hash size={14}/> آیدی:
                        </span>
                        <div className="d-flex align-items-center gap-1">
                           <code className="text-secondary small dir-ltr">{ticket.userId?._id?.substring(0,8)}...</code>
                           <button onClick={() => handleCopy(ticket.userId?._id)} className="btn btn-link p-0 text-muted">
                             <Copy size={12} />
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Profile Button - UPDATED STYLE */}
                  <button 
                    onClick={() => navigate(`/users/details/${ticket.userId?._id}`)}
                    className="btn w-100 rounded-pill btn-sm d-flex align-items-center justify-content-center gap-2 text-white shadow-sm"
                    style={{
                        height:"50px",
                        background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)', // Blue/Purple gradient
                        border: 'none'
                    }}
                  >
                    <span>مشاهده جزئیات پروفایل</span>
                    <ExternalLink size={14} />
                  </button>
               </div>
            </div>

            {/* 3. Attachments Card */}
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                    <h6 className="mb-3 fw-bold text-muted small d-flex align-items-center gap-2">
                        <Paperclip size={16} />
                        فایل‌های ضمیمه ({attachments.length})
                    </h6>

                    {attachments.length > 0 ? (
                        <div className="d-flex flex-column gap-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
                            {attachments.map((file, idx) => {
                                const isImg = isImageFile(file.originalPath);
                                const isUserFile = file.sender === 'user';
                                
                                return (
                                    <div key={idx} className="d-flex align-items-center justify-content-between p-2 rounded-3 border border-light hover-bg-gray">
                                        <div className="d-flex align-items-center gap-2 overflow-hidden">
                                            <div className={`p-2 rounded-2 ${isUserFile ? 'bg-secondary-subtle text-secondary' : 'bg-primary-subtle text-primary'}`}>
                                                {isImg ? <ImageIcon size={16} /> : <FileText size={16} />}
                                            </div>
                                            <div className="d-flex flex-column" style={{minWidth: 0}}>
                                                <span className="text-dark small text-truncate fw-medium dir-ltr" style={{maxWidth: '120px'}}>
                                                    {file.originalPath.split('/').pop()?.split('-').pop()}
                                                </span>
                                                <span className="text-muted" style={{fontSize: '10px'}}>
                                                    {formatDate(file.date).date} • {isUserFile ? 'کاربر' : 'پشتیبان'}
                                                </span>
                                            </div>
                                        </div>
                                        <a 
                                            href={file.fullUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-link text-secondary"
                                            title="دانلود / مشاهده"
                                        >
                                            <Download size={16} />
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-3 text-muted bg-light rounded-3 small">
                            هیچ فایلی پیوست نشده است.
                        </div>
                    )}
                </div>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        body { background-color: #f9fafb; }
        .text-dark { color: #111827 !important; }
        .text-muted { color: #9ca3af !important; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .bg-gray-200 { background-color: #e5e7eb; }
        .hover-bg-gray:hover { background-color: #f3f4f6 !important; }
        .hover-bg-white-20:hover { background-color: rgba(255,255,255,0.2) !important; }
        .hover-lift { transition: transform 0.2s; }
        .hover-lift:hover { transform: translateY(-2px); }
        .focus-ring:focus {
           border-color: #8b5cf6 !important;
           box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15) !important;
        }
        .dir-ltr { direction: ltr; }
        .pointer-events-none { pointer-events: none; }
        .opacity-10 { opacity: 0.1; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default TicketDetails;
