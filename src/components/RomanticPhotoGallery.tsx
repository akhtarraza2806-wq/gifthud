import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Sparkles,
  Search,
  Filter,
  Maximize2,
  X,
  Share2,
  Download,
  Calendar,
  User,
  Tag,
  Eye,
  Camera,
  Layers,
  Sparkle
} from 'lucide-react';

export interface GalleryPhoto {
  id: string;
  title: string;
  category: 'hampers' | 'roses' | 'jewelry' | 'letters' | 'moments';
  categoryLabel: string;
  image: string;
  aspectRatio: 'aspect-[3/4]' | 'aspect-[4/5]' | 'aspect-[1/1]' | 'aspect-[9/16]' | 'aspect-[4/3]';
  likes: number;
  date: string;
  location?: string;
  photographer?: string;
  story: string;
  palette: string[];
}

const GALLERY_DATA: GalleryPhoto[] = [
  {
    id: 'photo-1',
    title: 'The Velvet Crimson Rose Bouquet',
    category: 'roses',
    categoryLabel: 'Floral & Roses',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
    aspectRatio: 'aspect-[3/4]',
    likes: 342,
    date: 'February 14, 2026',
    location: 'Paris, France',
    photographer: 'Camille Laurent',
    story: 'Freshly plucked Ecuadorian crimson roses wrapped in imported matte blush tissue and silk burgundy ribbon.',
    palette: ['#e11d48', '#881337', '#ffe4e8'],
  },
  {
    id: 'photo-2',
    title: 'Hand-Calligraphed Letter & Gold Wax Seal',
    category: 'letters',
    categoryLabel: 'Love Letters',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1000&auto=format&fit=crop',
    aspectRatio: 'aspect-[4/5]',
    likes: 512,
    date: 'February 10, 2026',
    location: 'Florence, Italy',
    photographer: 'Matteo Rossi',
    story: 'Deckle-edge handmade cotton paper inscribed with archival sepia ink and finished with a custom fleur-de-lis seal.',
    palette: ['#cfb27e', '#4c051a', '#fff5f6'],
  },
  {
    id: 'photo-3',
    title: 'Vintage Solitaire Ring in Velvet Box',
    category: 'jewelry',
    categoryLabel: 'Jewelry & Keepsakes',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop',
    aspectRatio: 'aspect-[1/1]',
    likes: 890,
    date: 'January 28, 2026',
    location: 'Venice, Italy',
    photographer: 'Elena Vance',
    story: 'An emerald-cut diamond framed by rose gold filigree, nestled within a handcrafted deep plum velvet jewel box.',
    palette: ['#bfa060', '#be1243', '#220b16'],
  },
  {
    id: 'photo-4',
    title: 'Champagne & Strawberry Sunset Toast',
    category: 'moments',
    categoryLabel: 'Date Moments',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1000&auto=format&fit=crop',
    aspectRatio: 'aspect-[4/3]',
    likes: 428,
    date: 'February 02, 2026',
    location: 'Amalfi Coast, Italy',
    photographer: 'Julian Thorne',
    story: 'Crisp vintage rosé poured into crystal flutes as the sun paints the Mediterranean horizon in gold and blush.',
    palette: ['#ede2cc', '#f43f68', '#876930'],
  },
  {
    id: 'photo-5',
    title: 'Bespoke Silk Wrapped Gift Hamper',
    category: 'hampers',
    categoryLabel: 'Luxury Hampers',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop',
    aspectRatio: 'aspect-[3/4]',
    likes: 674,
    date: 'January 19, 2026',
    location: 'London, UK',
    photographer: 'Sophia Sterling',
    story: 'Curated artisanal chocolates, damask rose mist, and embroidered linen tucked into a bespoke linen box.',
    palette: ['#fb7185', '#cfb27e', '#fff5f6'],
  },
  {
    id: 'photo-6',
    title: 'Artisanal Perfume & Petal Notes',
    category: 'jewelry',
    categoryLabel: 'Jewelry & Keepsakes',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
    aspectRatio: 'aspect-[4/5]',
    likes: 310,
    date: 'February 05, 2026',
    location: 'Grasse, France',
    photographer: 'Lucie Bernard',
    story: 'Hand-blended eau de parfum infused with Turkish rose essence, vanilla bourbon, and warm amber crystals.',
    palette: ['#fda4b4', '#881337', '#dfcca8'],
  },
  {
    id: 'photo-7',
    title: 'Candlelit Dinner by the Seine',
    category: 'moments',
    categoryLabel: 'Date Moments',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop',
    aspectRatio: 'aspect-[3/4]',
    likes: 720,
    date: 'January 14, 2026',
    location: 'Paris, France',
    photographer: 'Henri Dupont',
    story: 'Warm beeswax taper candles casting soft shadows across a table adorned with wild roses and handwritten menus.',
    palette: ['#b89859', '#380413', '#ffedf1'],
  },
  {
    id: 'photo-8',
    title: 'Delicate Dried Peony & Lace Keepsake',
    category: 'roses',
    categoryLabel: 'Floral & Roses',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1000&auto=format&fit=crop',
    aspectRatio: 'aspect-[1/1]',
    likes: 489,
    date: 'February 12, 2026',
    location: 'Kyoto, Japan',
    photographer: 'Aoi Tanaka',
    story: 'Pressed heirloom peonies preserved under convex glass, wrapped in vintage Chantilly lace.',
    palette: ['#fecdd6', '#9f1239', '#ede2cc'],
  },
  {
    id: 'photo-9',
    title: 'Wax-Sealed Love Notes in Gold Tray',
    category: 'letters',
    categoryLabel: 'Love Letters',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop',
    aspectRatio: 'aspect-[4/5]',
    likes: 605,
    date: 'January 30, 2026',
    location: 'Vienna, Austria',
    photographer: 'Klaus Weber',
    story: 'A collector’s tray of vintage stationery, hand-pressed wax seals, and ribbon spools prepared for secret vows.',
    palette: ['#e11d48', '#bfa060', '#1c0510'],
  },
];

interface TiltPhotoCardProps {
  photo: GalleryPhoto;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
  onOpenModal: (photo: GalleryPhoto) => void;
}

/**
 * 3D Tilt Card Component
 * Uses real-time mouse coordinate calculations to tilt with perspective,
 * dynamic glare shimmer, and parallax elevation of child layers.
 */
const TiltPhotoCard: React.FC<TiltPhotoCardProps> = ({
  photo,
  isLiked,
  onToggleLike,
  onOpenModal,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-14deg to +14deg max)
    const rotX = -((y - centerY) / centerY) * 12;
    const rotY = ((x - centerX) / centerX) * 12;

    // Glare position in percentages
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePosition({ x: glareX, y: glareY, opacity: 0.45 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      className="mb-6 break-inside-avoid"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onOpenModal(photo)}
        animate={{
          rotateX: rotateX,
          rotateY: rotateY,
          scale: isHovered ? 1.025 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 280,
          damping: 24,
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
        className="group relative rounded-3xl overflow-hidden bg-white dark:bg-velvet-900 border border-romantic-200/80 dark:border-velvet-700/80 shadow-md hover:shadow-2xl transition-shadow cursor-pointer select-none"
      >
        {/* Dynamic Specular Light Glare Overlay */}
        <div
          className="absolute inset-0 z-30 pointer-events-none rounded-3xl transition-opacity duration-300"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 240, 245, 0.25) 40%, transparent 70%)`,
          }}
        />

        {/* Photo Image Container */}
        <div className={`relative w-full ${photo.aspectRatio} overflow-hidden bg-romantic-100 dark:bg-velvet-950`}>
          <img
            src={photo.image}
            alt={photo.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* Luxury Gradient Darkening for Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10 opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

          {/* Top Floating Badge with 3D Depth */}
          <div
            style={{ transform: isHovered ? 'translateZ(30px)' : 'translateZ(0px)' }}
            className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between transition-transform duration-200"
          >
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-black/40 backdrop-blur-md border border-white/20 text-romantic-100 shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-champagne-400" />
              {photo.categoryLabel}
            </span>

            {/* Like Heart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike(photo.id);
              }}
              aria-label="Like photo"
              className={`p-2 rounded-full backdrop-blur-md border transition-all duration-200 ${
                isLiked
                  ? 'bg-romantic-500 text-white border-romantic-400 scale-110 shadow-romantic-md'
                  : 'bg-black/40 text-white/90 border-white/20 hover:bg-romantic-500/80 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Bottom Floating Info with 3D Parallax Depth */}
          <div
            style={{ transform: isHovered ? 'translateZ(35px)' : 'translateZ(0px)' }}
            className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-20 transition-transform duration-200 text-white flex flex-col justify-end"
          >
            <div className="flex items-center gap-2 mb-1.5 opacity-90 text-[11px] font-mono tracking-wider uppercase text-champagne-300">
              <span>{photo.location}</span>
              <span>•</span>
              <span>{photo.date}</span>
            </div>

            <h3 className="font-display font-bold text-base sm:text-lg leading-snug drop-shadow-sm text-white group-hover:text-romantic-100 transition-colors line-clamp-2">
              {photo.title}
            </h3>

            {/* Hover Reveal Details */}
            <div className="mt-2.5 pt-2.5 border-t border-white/15 flex items-center justify-between text-xs text-romantic-100/90 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <span className="flex items-center gap-1 text-[11px]">
                <Eye className="w-3 h-3 text-champagne-400" />
                <span>Click to expand story</span>
              </span>

              <div className="flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-romantic-400 fill-current" />
                <span className="font-semibold">{photo.likes + (isLiked ? 1 : 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const RomanticPhotoGallery: React.FC = () => {
  const [photos] = useState<GalleryPhoto[]>(GALLERY_DATA);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({
    'photo-1': true,
    'photo-3': true,
  });
  const [activeModalPhoto, setActiveModalPhoto] = useState<GalleryPhoto | null>(null);

  // Toggle Heart Like
  const handleToggleLike = (id: string) => {
    setLikedPhotos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filtered Photos List
  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      const matchesCategory =
        selectedCategory === 'all' || photo.category === selectedCategory;
      const matchesQuery =
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.story.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [photos, selectedCategory, searchQuery]);

  const categories = [
    { id: 'all', label: 'All Keepsakes', count: photos.length },
    { id: 'roses', label: 'Floral & Roses', count: photos.filter((p) => p.category === 'roses').length },
    { id: 'hampers', label: 'Luxury Hampers', count: photos.filter((p) => p.category === 'hampers').length },
    { id: 'jewelry', label: 'Jewelry & Keepsakes', count: photos.filter((p) => p.category === 'jewelry').length },
    { id: 'letters', label: 'Love Letters', count: photos.filter((p) => p.category === 'letters').length },
    { id: 'moments', label: 'Date Moments', count: photos.filter((p) => p.category === 'moments').length },
  ];

  return (
    <div className="space-y-8">
      {/* Header Controls: Search & Category Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-velvet-900/80 p-4 sm:p-6 rounded-3xl border border-romantic-200 dark:border-velvet-800 backdrop-blur-md shadow-sm">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-velvet-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search moments, floral arrangements, handwritten notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-medium text-velvet-900 dark:text-white placeholder:text-velvet-400 outline-none focus:ring-2 focus:ring-romantic-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-velvet-400 hover:text-romantic-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Info stats */}
        <div className="flex items-center gap-3 text-xs text-velvet-600 dark:text-velvet-300">
          <span className="flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-full bg-romantic-100/60 dark:bg-velvet-800 border border-romantic-200 dark:border-velvet-700">
            <Layers className="w-3.5 h-3.5 text-romantic-500" />
            <span>Showing {filteredPhotos.length} of {photos.length} photos</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-champagne-600 dark:text-champagne-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive 3D Tilt</span>
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-romantic-500 to-romantic-600 text-white shadow-romantic-sm scale-[1.02]'
                  : 'bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-700 text-velvet-700 dark:text-velvet-300 hover:border-romantic-300'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Responsive Masonry Layout */}
      {filteredPhotos.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-velvet-900 rounded-3xl border border-romantic-200 dark:border-velvet-800 p-8">
          <Camera className="w-10 h-10 mx-auto text-romantic-300 mb-3" />
          <h4 className="font-display text-lg font-bold text-romantic-900 dark:text-white">
            No romantic photos match your search
          </h4>
          <p className="text-xs text-velvet-500 dark:text-velvet-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or select "All Keepsakes" to view the full curated collection.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 btn-romantic-outline text-xs px-4 py-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-3 gap-6 [column-fill:_balance]">
          {filteredPhotos.map((photo) => (
            <TiltPhotoCard
              key={photo.id}
              photo={photo}
              isLiked={Boolean(likedPhotos[photo.id])}
              onToggleLike={handleToggleLike}
              onOpenModal={(p) => setActiveModalPhoto(p)}
            />
          ))}
        </div>
      )}

      {/* Lightbox / Full Inspection Modal */}
      <AnimatePresence>
        {activeModalPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalPhoto(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-velvet-900 rounded-[32px] overflow-hidden border border-romantic-200 dark:border-velvet-700 shadow-2xl z-10 flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalPhoto(null)}
                aria-label="Close modal"
                className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left: High-Res Photo View */}
              <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
                <img
                  src={activeModalPhoto.image}
                  alt={activeModalPhoto.title}
                  className="w-full h-full object-cover max-h-[60vh] md:max-h-[80vh]"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white/90 text-xs font-medium">
                  📸 {activeModalPhoto.photographer}
                </div>
              </div>

              {/* Right: Rich Story & Detail Panel */}
              <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[80vh] bg-gradient-to-b from-white to-romantic-50/40 dark:from-velvet-900 dark:to-velvet-950">
                <div className="space-y-4">
                  {/* Category & Date */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-3 py-1 rounded-full bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 font-semibold">
                      {activeModalPhoto.categoryLabel}
                    </span>
                    <span className="text-velvet-500 dark:text-velvet-400 font-mono">
                      {activeModalPhoto.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-2xl font-bold text-romantic-950 dark:text-white leading-tight">
                    {activeModalPhoto.title}
                  </h3>

                  {/* Location & Meta */}
                  <div className="flex items-center gap-2 text-xs text-velvet-600 dark:text-velvet-300">
                    <span>📍 {activeModalPhoto.location}</span>
                  </div>

                  {/* Story Narrative */}
                  <div className="p-4 rounded-2xl bg-romantic-50 dark:bg-velvet-800/60 border border-romantic-100 dark:border-velvet-700/60">
                    <p className="font-serif italic text-sm text-velvet-800 dark:text-velvet-200 leading-relaxed">
                      "{activeModalPhoto.story}"
                    </p>
                  </div>

                  {/* Color Palette Swatches */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-2">
                      Aesthetic Swatches
                    </h5>
                    <div className="flex items-center gap-2">
                      {activeModalPhoto.palette.map((color, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <div
                            className="w-6 h-6 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                          <span className="text-[10px] font-mono text-velvet-500 dark:text-velvet-400">
                            {color}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Interactive Bar */}
                <div className="pt-6 mt-6 border-t border-romantic-200 dark:border-velvet-800 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleLike(activeModalPhoto.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all ${
                      likedPhotos[activeModalPhoto.id]
                        ? 'bg-romantic-500 text-white shadow-romantic-md'
                        : 'bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 hover:bg-romantic-200'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        likedPhotos[activeModalPhoto.id] ? 'fill-current' : ''
                      }`}
                    />
                    <span>
                      {likedPhotos[activeModalPhoto.id] ? 'Loved' : 'Love Moment'} (
                      {activeModalPhoto.likes + (likedPhotos[activeModalPhoto.id] ? 1 : 0)})
                    </span>
                  </button>

                  <a
                    href={activeModalPhoto.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-romantic-200 dark:border-velvet-700 hover:bg-romantic-100 dark:hover:bg-velvet-800 text-velvet-600 dark:text-velvet-300 transition-colors"
                    title="Open Full Image"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RomanticPhotoGallery;
