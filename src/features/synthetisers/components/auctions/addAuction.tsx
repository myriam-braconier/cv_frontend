const handleCreateAuction = async () => {
    const token = checkToken();
    if (!token) {
        router.push("/login");
        return;
    }