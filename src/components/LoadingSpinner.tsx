export function LoadingSpinner() {
    return (
      <div className="col-span-full text-center p-4" role="status">
        <div className="animate-pulse flex items-center justify-center">
          <div className="h-8 w-8 bg-blue-500 rounded-full animate-bounce"></div>
          <span className="ml-3">Chargement...</span>
        </div>
      </div>
    );
  }