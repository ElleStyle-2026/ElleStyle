import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductDetailSection } from '../components/organisms/ProductDetailSection';
import { ProductReviewSection } from '../components/organisms/ProductReviewSection';
import { ProductCard } from '../components/molecules/ProductCard';
import { Typography } from '../components/atoms/Typography';
import { publicProductService } from '../services/publicProductService';

const ProductPage: React.FC = () => {
  const { id: slug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await publicProductService.getProductBySlug(slug);
        if (res.success && res.data) {
          const p = res.data;
          
          // Fetch reviews
          let reviews = [];
          try {
            const reviewRes = await publicProductService.getProductReviews(p._id);
            if (reviewRes.success) {
              reviews = reviewRes.data.map((r: any) => ({
                id: r._id,
                author: r.customerName,
                avatar: r.customerProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.customerName)}&background=random`,
                date: new Date(r.createdAt).toLocaleDateString(),
                rating: r.rating,
                text: r.comment,
                media: r.media || [],
                images: r.images || [],
                likes: r.likes || 0,
                dislikes: r.dislikes || 0
              }));
            }
          } catch (e) {
            console.error('Failed to fetch reviews', e);
          }

          const activeVariants = (p.variants || []).filter((v: any) => v.isActive !== false);
          let displayVariants = activeVariants;
          
          if (activeVariants.length > 0) {
            // Priority 1/2: Base product color from attributes
            const attrColor = p.attributes?.find((a: any) => a.key.toLowerCase() === 'color' || a.key.toLowerCase() === 'basecolor');
            // Priority 3: Product name, Priority 4: 'Default'
            const baseColorName = attrColor?.value || p.name || 'Default';
            
            // Try to find matching hex if it's a known color in swatches
            const matchingSavedColor = p.colors?.find((c: any) => c.name.toLowerCase() === baseColorName.toLowerCase());
            
            // Priority 1: Explicit basecolorhex attribute
            const attrColorHex = p.attributes?.find((a: any) => a.key.toLowerCase() === 'basecolorhex');
            const baseColorHex = attrColorHex?.value || matchingSavedColor?.hex || '';
            
            const baseVariant = {
              _id: 'base',
              name: baseColorName,
              price: p.price,
              image: p.images?.[0]?.secure_url || '',
              colorName: baseColorName,
              colorHex: baseColorHex,
              isActive: true,
              isBase: true
            };
            displayVariants = [baseVariant, ...activeVariants];
          }

          const mappedProduct = {
            id: p._id,
            category: p.category?.name?.toLowerCase().replace(/ /g, '-') || 'default',
            title: p.name,
            price: p.price,
            description: p.description || 'No description available.',
            imageSrc: p.images?.[0]?.secure_url || '',
            thumbnails: p.images?.map((img: any) => img.secure_url) || [],
            mainNotes: p.tags || [],
            variants: displayVariants,
            ratingAverage: p.ratingAverage || 0,
            reviewCount: p.reviewCount || 0,
            reviews: reviews,
            handmadeTime: p.handmadeTime,
            countryOfOrigin: p.countryOfOrigin,
            material: p.material,
            weight: p.weight,
            dimensions: p.dimensions,
            sku: p.sku,
            brand: p.brand,
            availability: p.availability,
            attributes: p.attributes || [],
            stock: p.stock,
            compareAtPrice: p.compareAtPrice,
            lowStockAlertActive: p.lowStockAlertActive,
            lowStockAlertThreshold: p.lowStockAlertThreshold,
            lowStockAlertMessage: p.lowStockAlertMessage,
            paymentMethod: p.paymentMethod,
            returnWarranty: p.returnWarranty,
            sellingMode: p.sellingMode,
            setOptions: p.setOptions,
            moqConfig: p.moqConfig,
            relatedProducts: [] // We'll set this separately
          };
          
          setProductData(mappedProduct);
          
          // Fetch related products
          const relatedRes = await publicProductService.getRelatedProducts(slug);
          if (relatedRes.success) {
            setRelatedProducts(relatedRes.data);
          }
        } else {
          navigate('/404');
        }
      } catch (error) {
        console.error('Failed to fetch product', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [slug, navigate]);

  useEffect(() => {
    if (productData?.category) {
      document.documentElement.setAttribute('data-category', productData.category);
      return () => {
        document.documentElement.removeAttribute('data-category');
      };
    }
  }, [productData?.category]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <p className="font-sans text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <p className="font-sans text-gray-500">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-8" style={{ backgroundColor: 'var(--bg-page)' }}>

      <ProductDetailSection product={productData} />
      
      <ProductReviewSection 
        productId={productData.id} 
        ratingAverage={productData.ratingAverage}
        reviewCount={productData.reviewCount}
        reviews={productData.reviews} 
      />

      {relatedProducts.length > 0 && (
        <section className="py-16 md:py-24 px-4 w-full" style={{ backgroundColor: 'var(--bg-page)' }}>
          <div className="max-w-7xl mx-auto">
            <Typography variant="h2" className="text-center mb-16">You might also like</Typography>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-8 lg:gap-x-6 mb-12">
              {relatedProducts.slice(0, 5).map((p: any, index: number) => {
                const imgUrl = p.images?.find((img: any) => img.isFeatured)?.secure_url || p.images?.[0]?.secure_url || '';
                return (
                  <div key={p._id} className={index === 4 ? 'hidden lg:block' : ''}>
                    <ProductCard
                      id={p.slug}
                      title={p.name}
                      price={p.price}
                      description={p.description || ''}
                      imageSrc={imgUrl}
                      altText={p.name}
                      product={p}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-4">
              <button 
                onClick={() => navigate(`/category/${productData.category}`)}
                className="px-8 py-3 rounded-full bg-[#03989E] text-white text-[13px] font-sans font-semibold transition-colors hover:bg-[#027A7E]"
              >
                See More
              </button>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductPage;
