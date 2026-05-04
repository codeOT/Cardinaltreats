import { IcArrow } from "@/app/components/ui/icons";
import Image from "next/image";

interface DeliveryBannerProps {
  onShopClick: () => void;
}

export function DeliveryBanner({ onShopClick }: DeliveryBannerProps){
  const whatsappNumber = "+2349040244449"; 
  const whatsappMessage = "Hi! I'd like to know more about Cardinal Treats cashews.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-green-100 text-xs font-bold uppercase tracking-widest mb-2">
            Questions?
          </p>
          <h3 className="font-display text-3xl md:text-4xl font-black text-white leading-tight mb-2">
            Chat with Our Sales Team
          </h3>
          <p className="text-green-50 text-sm md:text-base max-w-md">
            Have questions about our premium cashews? Get quick answers or order via WhatsApp. We&apos;re here to help!
          </p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white  font-bold px-8 py-4 rounded-full flex items-center gap-2 shadow-lg flex-shrink-0 text-sm transition-all hover:shadow-xl hover:scale-105"
        >
         <Image src="/images/whatsapp.png" alt="WhatsApp" width={20} height={20} />
          Message on WhatsApp <IcArrow />
        </a>
      </div>
    </div>
  );
}