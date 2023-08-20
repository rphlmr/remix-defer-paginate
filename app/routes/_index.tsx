import {
	type DataFunctionArgs,
	type V2_MetaFunction,
	defer,
} from "@remix-run/node";
import { faker } from "@faker-js/faker";
import { Await, Form, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

export const meta: V2_MetaFunction = () => {
	return [
		{ title: "New Remix App" },
		{ name: "description", content: "Welcome to Remix!" },
	];
};

const salesFromDB = Array.from(
	{ length: 21 },
	() =>
		({
			id: faker.string.nanoid(),
			product: faker.commerce.productName(),
			email: faker.internet.email({ provider: "gmail" }),
		}) as const,
);

async function getSales(page: number = 1) {
	await new Promise((resolve) => setTimeout(resolve, 1_500));

	const offset = (page - 1) * 10;

	const sales = salesFromDB.slice(offset, offset + 11); // 10 + 1 for hasNext
	console.log(salesFromDB, offset, sales);

	return { results: sales.slice(0, 10), hasNext: sales.length === 11 };
}

export async function loader({ request }: DataFunctionArgs) {
	const searchParams = new URL(request.url).searchParams;
	const pageParam = Number(searchParams.get("page")) || 1;
	const page = pageParam < 1 ? 1 : pageParam;

	console.log("server", page);

	return defer({
		page,
		sales: getSales(page),
	});
}

export default function Index() {
	const { sales, page } = useLoaderData<typeof loader>();

	console.log(page);
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

					<Suspense
						fallback={
							<tbody>
								<tr>
									<td>Loading...</td>
								</tr>
							</tbody>
						}
					>
						<Await
							resolve={sales}
							errorElement={
								<tbody>
									<tr>
										<td>Error loading sales!</td>
									</tr>
								</tbody>
							}
						>
							{(sales) => (
								<tbody>
									{sales.results.map((sale) => (
										<tr key={sale.id}>
											<td>{sale.id}</td>
											<td>{sale.product}</td>
											<td>{sale.email}</td>
										</tr>
									))}
								</tbody>
							)}
						</Await>
					</Suspense>
				</table>
				<div
					style={{
						display: "flex",
						gap: "1rem",
					}}
				>
					{page > 1 && (
						<Form reloadDocument>
							<button name="page" value={page - 1}>
								Prev
							</button>
						</Form>
					)}
					<Suspense>
						<Await resolve={sales}>
							{(sales) =>
								sales.hasNext && (
									<Form reloadDocument>
										<button name="page" value={page + 1}>
											Next
										</button>
									</Form>
								)
							}
						</Await>
					</Suspense>
				</div>
			</div>
		</div>
	);
}
