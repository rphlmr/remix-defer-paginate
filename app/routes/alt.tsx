import { useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { useSalesFetcher } from "./resources.sales";

export default function Index() {
	const [searchParams, setSearchParams] = useSearchParams();
	const { fetchSales, isLoading, sales } = useSalesFetcher();

	const page = Number(searchParams.get("page")) || 1;

	console.log(isLoading, sales);

	useEffect(() => {
		fetchSales(page);
	}, [fetchSales, page]);

	return (
		<div
			style={{
				width: "80vw",
				margin: "0 auto",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<h1>Sales</h1>
				<table>
					<thead>
						<tr>
							<th>Command ID</th>
							<th>Product Name</th>
							<th>Customer Email</th>
						</tr>
					</thead>

					<tbody>
						{!isLoading &&
							sales &&
							sales.results.map((sale) => (
								<tr key={sale.id}>
									<td>{sale.id}</td>
									<td>{sale.product}</td>
									<td>{sale.email}</td>
								</tr>
							))}
						{isLoading && (
							<tr>
								<td>Loading...</td>
							</tr>
						)}
					</tbody>
				</table>
				<div
					style={{
						display: "flex",
						gap: "1rem",
					}}
				>
					{page > 1 && (
						<button
							onClick={() =>
								setSearchParams({ page: `${page - 1}` })
							}
						>
							Prev
						</button>
					)}
					{sales?.hasNext && (
						<button
							onClick={() =>
								setSearchParams({ page: `${page + 1}` })
							}
						>
							Next
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
