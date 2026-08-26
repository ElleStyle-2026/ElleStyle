import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { adminReviewService, type AdminReview } from '../services/reviewService';

import { createAdminTestimonialShowcase } from '../services/adminTestimonialShowcaseService';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<AdminReview | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ product: '', customerName: '', rating: 5, comment: '', customerEmail: 'admin@elestyle.in' });

  // Showcase state
  const [showcaseModalOpen, setShowcaseModalOpen] = useState(false);
  const [reviewToShowcase, setReviewToShowcase] = useState<AdminReview | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
  const [showcaseBadge, setShowcaseBadge] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await adminReviewService.getReviews();
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (review: AdminReview, newStatus: 'approved' | 'rejected') => {
    try {
      await adminReviewService.updateReviewStatus(review._id, newStatus);
      setReviews(reviews.map(r => r._id === review._id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update review status');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, review: AdminReview) => {
    e.stopPropagation();
    setReviewToDelete(review);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      await adminReviewService.deleteReview(reviewToDelete._id);
      setReviews(reviews.filter(r => r._id !== reviewToDelete._id));
    } catch (error) {
      console.error('Failed to delete review', error);
    } finally {
      setDeleteModalOpen(false);
      setReviewToDelete(null);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminReviewService.createReview(newReview);
      setCreateModalOpen(false);
      setNewReview({ product: '', customerName: '', rating: 5, comment: '', customerEmail: 'admin@elestyle.in' });
      fetchReviews();
    } catch (error) {
      console.error('Failed to create review', error);
      alert('Failed to create review. Make sure the Product ID is valid.');
    }
  };

  const handleShowcaseClick = (review: AdminReview) => {
    setReviewToShowcase(review);
    setSelectedMediaIndex(0);
    setShowcaseBadge(review.product?.name || '');
    setShowcaseModalOpen(true);
  };

  const handleCreateShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewToShowcase) return;

    let mediaUrl = '';
    let mediaType: 'image' | 'video' = 'image';

    if (reviewToShowcase.media && reviewToShowcase.media.length > 0) {
      mediaUrl = reviewToShowcase.media[selectedMediaIndex].url;
      mediaType = reviewToShowcase.media[selectedMediaIndex].type;
    } else if (reviewToShowcase.images && reviewToShowcase.images.length > 0) {
      mediaUrl = reviewToShowcase.images[selectedMediaIndex];
      mediaType = 'image';
    } else {
      alert('This review has no media to showcase.');
      return;
    }

    try {
      await createAdminTestimonialShowcase({
        review: reviewToShowcase._id,
        customerName: reviewToShowcase.customerName,
        mediaUrl,
        mediaType,
        badgeText: showcaseBadge,
        isActive: true,
        order: 0
      });
      alert('Added to homepage showcase successfully!');
      setShowcaseModalOpen(false);
      setReviewToShowcase(null);
    } catch (error: any) {
      console.error('Failed to create showcase', error);
      alert(error.message || 'Failed to create showcase');
    }
  };

  const columns: Column<AdminReview>[] = [
    {
      key: 'product',
      header: 'Product',
      render: (review) => <span className="font-medium text-gray-900">{review.product?.name || 'Unknown'}</span>
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (review) => (
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      )
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (review) => <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{review.comment}</p>
    },
    {
      key: 'media',
      header: 'Media',
      render: (review) => {
        const count = (review.media?.length || 0) + (review.images?.length || 0);
        return <span className="text-sm text-gray-500">{count > 0 ? `${count} items` : 'None'}</span>;
      }
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (review) => review.customerName
    },
    {
      key: 'status',
      header: 'Status',
      render: (review) => (
        <StatusBadge 
          status={
            review.status === 'approved' ? 'success' :
            review.status === 'rejected' ? 'error' : 'warning'
          } 
          label={review.status.charAt(0).toUpperCase() + review.status.slice(1)} 
        />
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (review) => (
        <div className="flex space-x-2">
          {review.status === 'approved' && ((review.media && review.media.length > 0) || (review.images && review.images.length > 0)) && (
            <button
              onClick={() => handleShowcaseClick(review)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-2"
            >
              Showcase
            </button>
          )}
          {review.status !== 'approved' && (
            <button
              onClick={() => handleStatusChange(review, 'approved')}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Approve
            </button>
          )}
          {review.status !== 'rejected' && (
            <button
              onClick={() => handleStatusChange(review, 'rejected')}
              className="text-orange-600 hover:text-orange-800 text-sm font-medium"
            >
              Reject
            </button>
          )}
          <button
            onClick={(e) => handleDeleteClick(e, review)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const filteredReviews = reviews.filter(r => 
    r.product?.name?.toLowerCase().includes(search.toLowerCase()) || 
    r.customerName.toLowerCase().includes(search.toLowerCase()) ||
    r.comment.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Reviews" />
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Add Review
        </button>
      </div>

      <DataTable
        data={filteredReviews}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by product, customer or comment..."
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* Create Manual Review Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add Manual Review</h3>
            <form onSubmit={handleCreateReview} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product ID (MongoDB ID)</label>
                <input required type="text" value={newReview.product} onChange={e => setNewReview({...newReview, product: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input required type="text" value={newReview.customerName} onChange={e => setNewReview({...newReview, customerName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <select value={newReview.rating} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-black">
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comment</label>
                <textarea required value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-black h-24" />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add to Showcase Modal */}
      {showcaseModalOpen && reviewToShowcase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Add to Homepage Showcase</h3>
            <p className="text-sm text-gray-600 mb-4">Select the media to feature on the homepage.</p>
            
            <form onSubmit={handleCreateShowcase} className="flex flex-col gap-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {(reviewToShowcase.media || []).map((m, idx) => (
                  <div 
                    key={idx} 
                    className={`shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer border-4 ${selectedMediaIndex === idx ? 'border-accent-teal' : 'border-transparent'}`}
                    onClick={() => setSelectedMediaIndex(idx)}
                  >
                    {m.type === 'video' ? (
                      <video src={m.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={m.url} className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
                {/* Fallback for legacy images */}
                {(!reviewToShowcase.media || reviewToShowcase.media.length === 0) && (reviewToShowcase.images || []).map((url, idx) => (
                  <div 
                    key={idx} 
                    className={`shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer border-4 ${selectedMediaIndex === idx ? 'border-accent-teal' : 'border-transparent'}`}
                    onClick={() => setSelectedMediaIndex(idx)}
                  >
                    <img src={url} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Badge Text</label>
                <input required type="text" value={showcaseBadge} onChange={e => setShowcaseBadge(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-black" placeholder="e.g. HANDMADE EARRINGS" />
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowcaseModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800">Add to Showcase</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
