import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SliderItem {
  id: number;
  title: string;
  description: string;
  image: string;
}

const slides: SliderItem[] = [
  {
    id: 1,
    title: "Quản lý nhân sự hiệu quả",
    description: "Tối ưu hóa quy trình quản lý nhân sự với các công cụ hiện đại và dễ sử dụng.",
		image: "https://www.vietnamworks.com/hrinsider/wp-content/uploads/2019/08/Untitled-design-325.png",
  },
  {
    id: 2,
    title: "Theo dõi thời gian làm việc",
    description: "Ghi nhận check-in, check-out và quản lý thời gian làm việc của nhân viên một cách chính xác.",
		image: "https://terra-plat.vn/wp-content/uploads/2024/05/Website-Post-1-1.png",
  },
  {
    id: 3,
    title: "Quản lý nghỉ phép và bảo hiểm",
    description: "Dễ dàng xử lý đơn xin nghỉ phép và quản lý thông tin bảo hiểm của nhân viên.",
		image: "https://lh3.googleusercontent.com/wG4Hf1flsnc8-BCeM8LQ_ClMRMBHKYPlfA4SffQbkYnNxPySiU0liXmkqDIqvSpEbORV0lwyQAAuK1Cc2Jy85u6tXB6xne7b6xxDKxqapIP5Np07AIde2MsapiXzTUzjrMJVK0Pw=s0",
  },
  {
    id: 4,
    title: "Báo cáo và thống kê",
    description: "Tạo báo cáo chi tiết và thống kê để có cái nhìn tổng quan về hoạt động nhân sự.",
		image: "https://terra-plat.vn/wp-content/uploads/2024/05/Website-Post-3-1.png",
  }
];

export function LoginSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div 
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="w-full h-full flex-shrink-0 relative"
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${slide.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
            
            <div className="relative z-10 h-full flex flex-col justify-end p-12 text-white">
              <div className="max-w-lg">
                <h1 className="text-4xl font-bold mb-4 leading-tight animate-fade-in">
                  {slide.title}
                </h1>
                <p className="text-lg text-gray-200 mb-8 animate-fade-in-delay">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 text-white z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 text-white z-20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Pagination dots */}
      <div className="absolute bottom-12 left-12 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
}