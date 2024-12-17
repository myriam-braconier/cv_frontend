import type { NextPage } from "next";
import SynthList from "./synthetisers/page";

const Home: NextPage = () => {
	return (
		<main className="container mx-auto">
			<h1 className="text-3xl font-bold my-6">Liste des Synthétiseurs</h1>
			<SynthList />
		</main>
	);
};

export default Home;
