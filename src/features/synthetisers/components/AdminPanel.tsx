interface AdminPanelProps {
    onRefresh: () => void;
  }
  
  export function AdminPanel({ onRefresh }: AdminPanelProps) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Panel Administrateur</h2>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            type="button"
          >
            Rafraîchir la liste
          </button>
        </div>
      </div>
    );
  }