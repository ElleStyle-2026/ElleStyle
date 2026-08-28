import React, { useEffect, useState, useRef } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { type TestimonialShowcase } from '../../services/publicTestimonialShowcaseService';
import { getAdminTestimonialShowcases, createAdminTestimonialShowcase, updateAdminTestimonialShowcase, deleteAdminTestimonialShowcase, reorderAdminTestimonialShowcase } from '../services/adminTestimonialShowcaseService';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import toast from '../../lib/adminToast';

export default function TestimonialShowcasePage() {
  const [showcases, setShowcases] = useState<TestimonialShowcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showcaseToDelete, setShowcaseToDelete] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingMedia, setExistingMedia] = useState<{ mediaUrl: string, mediaType: string } | null>(null);
  const [newShowcase, setNewShowcase] = useState({ customerName: '', badgeText: '' });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchShowcases = async () => {
    try {
      setLoading(true);
      const data = await getAdminTestimonialShowcases();
      setShowcases(data);
    } catch (error) {
      console.error('Failed to fetch showcases', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowcases();
  }, []);

  const handleDeleteClick = (id: string) => {
    setShowcaseToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleEditClick = (showcase: TestimonialShowcase) => {
    setNewShowcase({ customerName: showcase.customerName, badgeText: showcase.badgeText || '' });
    setExistingMedia({ mediaUrl: showcase.mediaUrl, mediaType: showcase.mediaType });
    setPreviewUrl(showcase.mediaUrl);
    setIsEditing(true);
    setEditingId(showcase._id);
    setCreateModalOpen(true);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === showcases.length - 1)) return;

    const newShowcases = [...showcases];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap items
    [newShowcases[index], newShowcases[targetIndex]] = [newShowcases[targetIndex], newShowcases[index]];

    // Update their order property sequentially
    const updatedItems = newShowcases.map((item, idx) => ({ ...item, order: idx + 1 }));

    // Optimistic update
    setShowcases(updatedItems);

    try {
      await reorderAdminTestimonialShowcase(
        updatedItems.map(item => ({ _id: item._id, order: item.order }))
      );
      toast.success('Order updated successfully');
    } catch (error: any) {
      console.error('Failed to update order', error);
      toast.error('Failed to update order');
      fetchShowcases(); // revert on failure
    }
  };

  const confirmDelete = async () => {
    if (!showcaseToDelete) return;
    try {
      await deleteAdminTestimonialShowcase(showcaseToDelete);
      setShowcases(showcases.filter(s => s._id !== showcaseToDelete));
    } catch (error) {
      console.error('Failed to delete showcase', error);
    } finally {
      setDeleteModalOpen(false);
      setShowcaseToDelete(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type.startsWith('video/')) {
      if (selectedFile.size > 20 * 1024 * 1024) {
        alert('Video file size exceeds the 20MB limit.');
        e.target.value = '';
        return;
      }

      const url = URL.createObjectURL(selectedFile);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 120) {
          alert('Video playtime exceeds the 2 minute limit.');
          e.target.value = '';
          return;
        }
        setFile(selectedFile);
        setPreviewUrl(url);
      };
      video.src = url;
    } else {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeModal = () => {
    setCreateModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setNewShowcase({ customerName: '', badgeText: '' });
    setExistingMedia(null);
    clearFile();
  };

  const handleCreateShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing && !file) return;

    try {
      setIsUploading(true);
      let mediaUrl = existingMedia?.mediaUrl || '';
      let mediaType = existingMedia?.mediaType || 'image';

      if (file) {
        const formData = new FormData();
        formData.append('media', file);
        formData.append('category', 'showcase');
        formData.append('productSlug', 'manual');
        
        const uploadData = await apiClient('/api/v1/upload', {
          method: 'POST',
          body: formData
        });
        
        mediaUrl = uploadData.data[0].secure_url;
        mediaType = uploadData.data[0].type;
      }

      if (isEditing && editingId) {
        await updateAdminTestimonialShowcase(editingId, {
          customerName: newShowcase.customerName,
          badgeText: newShowcase.badgeText,
          mediaUrl,
          mediaType,
        });
        toast.success('Showcase updated successfully');
      } else {
        await createAdminTestimonialShowcase({
          customerName: newShowcase.customerName,
          badgeText: newShowcase.badgeText,
          mediaUrl,
          mediaType,
          isActive: true,
          order: showcases.length
        });
        toast.success('Showcase created successfully');
      }

      closeModal();
      fetchShowcases();
    } catch (error: any) {
      console.error('Failed to save showcase', error);
      toast.error(error.message || 'Failed to save showcase');
    } finally {
      setIsUploading(false);
    }
  };

  const columns: Column<TestimonialShowcase>[] = [
    {
      key: 'mediaUrl',
      header: 'Media',
      render: (s) => (
        <div className="w-16 h-16 rounded overflow-hidden">
          {s.mediaType === 'video' ? (
            <video src={s.mediaUrl} className="w-full h-full object-cover" />
          ) : (
            <img src={s.mediaUrl} className="w-full h-full object-cover" />
          )}
        </div>
      )
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (s) => <span className="font-medium text-gray-900">{s.customerName}</span>
    },
    {
      key: 'badgeText',
      header: 'Badge',
      render: (s) => s.badgeText || '-'
    },
    {
      key: 'isActive',
      header: 'Active',
      render: (s) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {s.isActive ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => {
        const index = showcases.findIndex(x => x._id === s._id);
        return (
          <div className="flex gap-4 items-center">
            <div className="flex flex-col gap-1 mr-2">
              <button
                disabled={index === 0}
                onClick={() => handleMove(index, 'up')}
                className="text-gray-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                disabled={index === showcases.length - 1}
                onClick={() => handleMove(index, 'down')}
                className="text-gray-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => handleEditClick(s)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteClick(s._id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        );
      }
    }
  ];

  const filteredShowcases = showcases.filter(s => 
    s.customerName.toLowerCase().includes(search.toLowerCase()) || 
    (s.badgeText || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Homepage Showcase" />
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Add Showcase
        </button>
      </div>

      <DataTable
        data={filteredShowcases}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by customer or badge..."
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Showcase"
        message="Are you sure you want to remove this showcase from the homepage?"
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {createModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Showcase' : 'Add Manual Showcase'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateShowcase} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Customer Name</label>
                <input required type="text" value={newShowcase.customerName} onChange={e => setNewShowcase({...newShowcase, customerName: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="e.g. Jane Doe" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Badge Text</label>
                <input required type="text" value={newShowcase.badgeText} onChange={e => setNewShowcase({...newShowcase, badgeText: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="e.g. HANDMADE EARRINGS" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Media (Image or Video)</label>
                {!previewUrl ? (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-black transition-colors group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-10 h-10 mb-3 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <p className="mb-1 text-sm text-gray-500 group-hover:text-gray-900"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500">SVG, PNG, JPG, MP4 or WEBM (up to 20MB, max 2 min video)</p>
                    </div>
                    <input required={!isEditing} type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/mp4,video/webm,video/quicktime" />
                  </label>
                ) : (
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group">
                    {file?.type.startsWith('video/') || existingMedia?.mediaType === 'video' ? (
                      <video src={previewUrl!} className="w-full h-full object-contain" controls />
                    ) : (
                      <img src={previewUrl!} className="w-full h-full object-contain" alt="Preview" />
                    )}
                    <button type="button" onClick={clearFile} className="absolute top-2 right-2 bg-white/90 backdrop-blur text-red-600 rounded-full p-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-red-700">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} disabled={isUploading} className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isUploading || (!isEditing && !file)} className={`flex-1 px-4 py-3 text-sm font-medium bg-black text-white rounded-xl hover:bg-gray-900 transition-all ${isUploading ? 'opacity-70 cursor-not-allowed' : 'shadow-lg hover:shadow-xl hover:-translate-y-0.5'}`}>
                  {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Uploading...
                    </span>
                  ) : (isEditing ? 'Update Showcase' : 'Create Showcase')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
