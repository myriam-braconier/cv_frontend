export const useAuctions = (synthetiser) => {
    const [isLoading, setIsLoading] = useState(false);


    
    // ... logique des enchères
    return { isLoading, handleCreateAuction, getLatestAuctionPrice };
  };