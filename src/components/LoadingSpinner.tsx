import Image from 'next/image';
export function LoadingSpinner() {
    return (
      <div className="col-span-full text-center p-4" role="status">
    <div className="flex items-center justify-center">
      <Image 
        src="/images/sound.gif"
        alt="Chargement"
        width={128}
        height={128}
        unoptimized
      />
      <span className="ml-3">Chargement...</span>
    </div>
  </div>
    );
  }