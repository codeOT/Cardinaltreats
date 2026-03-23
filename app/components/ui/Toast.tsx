interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <div className="anim-toastUp fixed bottom-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-sm font-semibold px-6 py-3 rounded-full shadow-2xl z-[500] whitespace-nowrap flex items-center gap-2.5">
      <span className="w-2 h-2 rounded-full bg-amber-400 anim-pulse" />
      {message}
    </div>
  );
}