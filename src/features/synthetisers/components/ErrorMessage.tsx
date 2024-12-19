interface ErrorMessageProps {
    message: string;
    onRetry: () => void;
  }
  
  export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
      <div className="col-span-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 mb-4">{message}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            type="button"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }