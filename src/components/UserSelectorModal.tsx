// src/components/UserSelectorModal.tsx

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Users, Check, Loader2, ChevronDown, X } from 'lucide-react';
import { toast } from 'react-toastify';

export interface User {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface UserSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedUsers: User[]) => void;
  initialSelectedUsers?: User[];
  title?: string;
  multiSelect?: boolean;
}

const UserSelectorModal: React.FC<UserSelectorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialSelectedUsers = [],
  title = 'انتخاب کاربران',
  multiSelect = true,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [localSelected, setLocalSelected] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    if (isOpen) {
      setLocalSelected(initialSelectedUsers);
      setSearchTerm('');
      setPage(1);
      fetchUsers(1, '', false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchUsers(1, searchTerm, false);
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchUsers = async (pageNum: number, search: string, isLoadMore: boolean) => {
    try {
      if (isLoadMore) setIsLoadingMore(true);
      else setIsLoading(true);
      const params: any = { limit: LIMIT, page: pageNum };
      if (search) params.search = search;

      const response = await api.get<any>('/user/menu', { params });
      const fetchedList = response.data.users || response.data.list || [];
      const total = response.data.total || 0;

      if (isLoadMore) setUsers((prev) => [...prev, ...fetchedList]);
      else setUsers(fetchedList);
      setTotalDocs(total);
    } catch (error) {
      console.error(error);
      toast.error('خطا در دریافت کاربران');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const toggleUser = (user: User) => {
    if (multiSelect) {
      const exists = localSelected.find((u) => u._id === user._id);
      if (exists) setLocalSelected((prev) => prev.filter((u) => u._id !== user._id));
      else setLocalSelected((prev) => [...prev, user]);
    } else {
      setLocalSelected([user]);
    }
  };

  const handleConfirm = () => {
    onConfirm(localSelected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="usm-overlay fade-in">
        <div className="usm-content">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
            <div>
              <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                <Users className="text-primary" size={22} /> {title}
              </h5>
              <small className="text-muted">{localSelected.length} مورد انتخاب شده</small>
            </div>
            <button onClick={onClose} className="btn btn-light rounded-circle p-2">
              <X size={20} />
            </button>
          </div>

          <div className="position-relative mb-3">
            <Search
              className="position-absolute text-muted"
              size={18}
              style={{ top: '12px', right: '12px' }}
            />
            <input
              type="text"
              className="form-control bg-light border-0 pe-5 py-2"
              placeholder="جستجو (نام، ایمیل)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          <div className="usm-list custom-scrollbar mb-3">
            {isLoading ? (
              <div className="text-center py-5">
                <Loader2 size={30} className="animate-spin text-primary" />
                <p className="mt-2 text-muted small">در حال بارگذاری...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-5 text-muted">یافت نشد.</div>
            ) : (
              <>
                {users.map((user) => {
                  const isSelected = localSelected.some((u) => u._id === user._id);
                  return (
                    <div
                      key={user._id}
                      onClick={() => toggleUser(user)}
                      className={`d-flex align-items-center justify-content-between p-3 rounded-3 mb-2 cursor-pointer transition-all border ${isSelected ? 'bg-primary-subtle border-primary shadow-sm' : 'bg-white border-light hover-bg-light'}`}
                    >
                      <div className="d-flex align-items-center gap-3 w-100 overflow-hidden">
                        <div
                          className={`rounded-circle p-2 flex-shrink-0 ${isSelected ? 'bg-primary text-white' : 'bg-light text-secondary'}`}
                          style={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Users size={20} />
                        </div>
                        <div className="text-truncate">
                          <p className="fw-bold text-dark mb-0 text-truncate dir-ltr text-end">
                            {user.username}
                          </p>
                          <small className="text-muted d-block text-truncate">
                            {user.firstName || user.lastName
                              ? `${user.firstName || ''} ${user.lastName || ''}`
                              : user.email}
                          </small>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ms-2">
                        {isSelected ? (
                          <div className="bg-primary text-white rounded-circle p-1">
                            <Check size={14} />
                          </div>
                        ) : (
                          <div
                            className="border rounded-circle"
                            style={{ width: '22px', height: '22px', opacity: 0.3 }}
                          ></div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {users.length < totalDocs && (
                  <button
                    onClick={() => fetchUsers(page + 1, searchTerm, true)}
                    disabled={isLoadingMore}
                    className="btn btn-light text-primary w-100 py-2 mt-2 d-flex justify-content-center gap-2"
                  >
                    {isLoadingMore ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ChevronDown size={16} />
                    )}{' '}
                    نمایش بیشتر
                  </button>
                )}
              </>
            )}
          </div>

          <button onClick={handleConfirm} className="btn btn-primary w-100 py-2 fw-bold rounded-3">
            تایید ({localSelected.length})
          </button>
        </div>
      </div>
      <style>{`
        .usm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1060; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); }
        .usm-content { background: white; width: 95%; max-width: 480px; padding: 25px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-height: 85vh; display: flex; flex-direction: column; }
        .usm-list { overflow-y: auto; flex-grow: 1; min-height: 200px; padding-right: 5px; }
        .fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-spin { animation: spin 1s linear infinite; }
        .bg-primary-subtle { background-color: #eef2ff; }
        .hover-bg-light:hover { background-color: #f8f9fa; border-color: #e9ecef; }
        .cursor-pointer { cursor: pointer; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .dir-ltr { direction: ltr; }
      `}</style>
    </>
  );
};
export default UserSelectorModal;
