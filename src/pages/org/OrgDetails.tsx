// src/pages/org/OrgDetails.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
    ArrowRight,
    Edit3,
    User,
    Mail,
    Phone,
    AtSign,
    Calendar,
    Hash,
    ShieldCheck
} from 'lucide-react';

interface OrgData {
    _id: string;
    name: string;
    family: string;
    username: string;
    email: string;
    mobile: string;
    createdAt?: string;
    updatedAt?: string;
    status?: string;
}

const OrgDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [org, setOrg] = useState<OrgData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // فرمت تاریخ به شمسی
    const formatDate = (isoString?: string) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                // فراخوانی متد GET برای دریافت جزئیات
                const response = await api.get(`/org/details?_id=${id}`);
                // با توجه به ساختار ریسپانس در صورت نیاز فیلد را تنظیم کنید (مثلا response.data.org یا response.data)
                const data = response.data.org || response.data;
                setOrg(data);
            } catch (error) {
                console.error('Error fetching org details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
            </div>
        );
    }

    if (!org) {
        return (
            <div className="text-center mt-5 fade-in">
                <h3 className="text-muted mb-4">اطلاعات سازمان/کاربر یافت نشد!</h3>
                <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate('/org/list')}>
                    بازگشت به لیست
                </button>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4 p-md-5 fade-in" style={{ maxWidth: '1200px' }}>

            {/* Header Actions */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <button
                    onClick={() => navigate('/org/list')}
                    className="btn btn-white border shadow-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 back-btn w-auto me-auto me-md-0"
                >
                    <ArrowRight size={18} className="text-secondary" />
                    <span className="text-secondary fw-bold">بازگشت به لیست</span>
                </button>

                <Link
                    to={`/org/edit/${org._id}`}
                    className="btn btn-primary shadow-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 edit-btn w-auto"
                >
                    <Edit3 size={18} />
                    <span className="fw-bold">ویرایش اطلاعات</span>
                </Link>
            </div>

            <div className="row g-4">
                {/* Profile Summary Card */}
                <div className="col-12">
                    <div className="card border-0 custom-card rounded-4 p-4 p-md-5 bg-white position-relative overflow-hidden d-flex flex-column flex-md-row align-items-center gap-4">
                        <div className="position-absolute top-0 start-0 w-100 bg-primary" style={{ height: '5px' }}></div>

                        {/* Avatar Placeholder */}
                        <div className="avatar-wrapper bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style={{ width: '100px', height: '100px' }}>
                            <User size={48} strokeWidth={1.5} />
                        </div>

                        <div className="text-center text-md-start flex-grow-1">
                            <h2 className="fw-bolder text-dark mb-1">{org.name} {org.family}</h2>
                            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 text-muted mb-2">
                                <AtSign size={16} />
                                <span className="fs-5" dir="ltr">{org.username}</span>
                            </div>
                            <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1 mt-2">
                                <ShieldCheck size={16} /> فعال
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contact Info Card */}
                <div className="col-lg-6">
                    <div className="card border-0 custom-card rounded-4 p-4 h-100 bg-white">
                        <h5 className="fw-bold text-dark mb-4 border-bottom pb-3 d-flex align-items-center gap-2">
                            <Mail className="text-primary" size={20} />
                            اطلاعات ارتباطی
                        </h5>

                        <div className="d-flex flex-column gap-4 mt-2">
                            <div className="d-flex align-items-start gap-3">
                                <div className="icon-box bg-light text-secondary rounded-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <small className="text-muted d-block mb-1">آدرس ایمیل</small>
                                    <span className="fw-medium text-dark fs-5" dir="ltr">{org.email}</span>
                                </div>
                            </div>

                            <div className="d-flex align-items-start gap-3">
                                <div className="icon-box bg-light text-secondary rounded-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <small className="text-muted d-block mb-1">شماره موبایل</small>
                                    <span className="fw-medium text-dark fs-5" dir="ltr">{org.mobile}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Info Card */}
                <div className="col-lg-6">
                    <div className="card border-0 custom-card rounded-4 p-4 h-100 bg-white">
                        <h5 className="fw-bold text-dark mb-4 border-bottom pb-3 d-flex align-items-center gap-2">
                            <Hash className="text-primary" size={20} />
                            اطلاعات سیستمی
                        </h5>

                        <div className="d-flex flex-column gap-4 mt-2">
                            <div className="d-flex align-items-start gap-3">
                                <div className="icon-box bg-light text-secondary rounded-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <Hash size={20} />
                                </div>
                                <div>
                                    <small className="text-muted d-block mb-1">شناسه یکتا (ID)</small>
                                    <span className="fw-medium text-secondary text-break font-monospace small" dir="ltr">{org._id}</span>
                                </div>
                            </div>

                            <div className="d-flex align-items-start gap-3">
                                <div className="icon-box bg-light text-secondary rounded-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <small className="text-muted d-block mb-1">تاریخ ثبت در سیستم</small>
                                    <span className="fw-medium text-dark">{formatDate(org.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
        .fade-in { animation: fadeInUp 0.4s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

        .custom-card {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .custom-card:hover { box-shadow: 0 15px 40px rgba(0, 0, 0, 0.06); }

        .back-btn { transition: all 0.2s ease; }
        .back-btn:hover { background-color: #f8f9fa; transform: translateX(-3px); }

        .edit-btn { transition: all 0.3s ease; }
        .edit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(19, 83, 6, 0.3) !important; }
        .edit-btn { background: linear-gradient(45deg, #099773, #20c997); color: white; padding: 8px 20px; border-radius: 12px; border: none; box-shadow: 0 4px 15px rgba(32, 201, 151, 0.4); transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; font-weight: 600; }


        .bg-primary-subtle { background-color: #e6f0ff !important; }
        .bg-success-subtle { background-color: #d1e7dd !important; }
        .icon-box { transition: all 0.3s ease; }
        .custom-card:hover .icon-box { background-color: #e6f0ff !important; color: #0d6efd !important; }
      `}</style>
        </div>
    );
};

export default OrgDetails;
