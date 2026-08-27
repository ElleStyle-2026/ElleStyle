import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { adminProductService, type AdminProduct } from '../services/productService';
import { adminCategoryService, type AdminCategory } from '../services/categoryService';
import { adminSubCategoryService, type AdminSubCategory } from '../services/subCategoryService';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [subCategories, setSubCategories] = useState<AdminSubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, subCategoriesData] = await Promise.all([
        adminProductService.getProducts(),
        adminCategoryService.getCategories(),
        adminSubCategoryService.getSubCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setSubCategories(subCategoriesData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubCategory('all');
  }, [selectedCategory]);

  const handleDeleteClick = (e: React.MouseEvent, product: AdminProduct) => {
    e.stopPropagation();
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await adminProductService.deleteProduct(productToDelete._id);
      setProducts(products.filter(p => p._id !== productToDelete._id));
    } catch (error) {
      console.error('Failed to delete product', error);
    } finally {
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const columns: Column<AdminProduct>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (product) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0].secure_url || product.images[0].previewUrl} alt="" className="h-10 w-10 object-cover" />
            ) : (
              <div className="h-10 w-10 bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Img</div>
            )}
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{product.name}</div>
            <div className="text-gray-500 text-xs">{product.slug}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'category', 
      header: 'Category',
      render: (product) => {
        if (typeof product.category === 'object' && product.category !== null) {
          return (product.category as any).name || 'Unknown';
        }
        return typeof product.category === 'string' ? product.category : 'Unknown';
      }
    },
    {
      key: 'price',
      header: 'Price',
      render: (product) => `₹${product.price}`
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product) => (
        <span className={`${product.stock < 10 ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
          {product.stock}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (product) => (
        <StatusBadge 
          status={product.status === 'active' ? 'success' : 'default'} 
          label={product.status} 
        />
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/products/${product._id}`);
            }}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={(e) => handleDeleteClick(e, product)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const filteredProducts = products.filter(p => {
    const searchLower = search.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(searchLower);
    
    let categoryId = '';
    let categoryName = '';
    if (typeof p.category === 'object' && p.category !== null) {
      categoryId = (p.category as any)._id || '';
      categoryName = (p.category as any).name || '';
    } else if (typeof p.category === 'string') {
      categoryId = p.category;
      categoryName = p.category;
    }
    
    let subCategoryId = '';
    if (typeof p.subCategory === 'object' && p.subCategory !== null) {
      subCategoryId = (p.subCategory as any)._id || '';
    } else if (typeof p.subCategory === 'string') {
      subCategoryId = p.subCategory;
    }

    const categoryMatch = selectedCategory === 'all' || categoryId === selectedCategory;
    const subCategoryMatch = selectedSubCategory === 'all' || subCategoryId === selectedSubCategory;
    const searchMatch = nameMatch || categoryName.toLowerCase().includes(searchLower);

    return searchMatch && categoryMatch && subCategoryMatch;
  });

  const activeSubCategories = useMemo(() => {
    if (selectedCategory === 'all') return [];
    return subCategories.filter(sub => {
      if (typeof sub.category === 'object' && sub.category !== null) {
        return (sub.category as any)._id === selectedCategory;
      }
      return sub.category === selectedCategory;
    });
  }, [subCategories, selectedCategory]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        actionButton={{
          label: 'Add Product',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => navigate('/admin/products/new')
        }}
      />
      
      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Sub-Category</label>
          <select 
            value={selectedSubCategory} 
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            disabled={selectedCategory === 'all' || activeSubCategories.length === 0}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="all">All Sub-Categories</option>
            {activeSubCategories.map(sub => (
              <option key={sub._id} value={sub._id}>{sub.name}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        data={filteredProducts}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search products by name or category..."
        onRowClick={(item) => navigate(`/admin/products/${item._id}`)}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action will set the product status to inactive (soft delete).`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

