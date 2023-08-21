import { type DataFunctionArgs, json } from "@remix-run/node";
import { faker } from "@faker-js/faker";
import { useFetcher, useSearchParams } from "@remix-run/react";
import { useCallback, useEffect } from "react";

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
	await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
	const offset = (page - 1) * 10;
	const sales = salesFromDB.slice(offset, offset + 11); // 10 + 1 for hasNext
	return { results: sales.slice(0, 10), hasNext: sales.length === 11 };
}

export async function loader({ request }: DataFunctionArgs) {
	const searchParams = new URL(request.url).searchParams;
	const pageParam = Number(searchParams.get("page")) || 1;
	const page = pageParam < 1 ? 1 : pageParam;
	return json({
		sales: await getSales(page),
	});
}

export function useSalesFetcher(
	{
		searchParam,
		defaultValue,
	}: { searchParam: string; defaultValue: number } = {
		searchParam: "page",
		defaultValue: 1,
	},
) {
	const { load, state, data } = useFetcher<typeof loader>();
	const [searchParams] = useSearchParams();
	const page = Number(searchParams.get(searchParam)) || defaultValue;
	const fetchSales = useCallback(
		(page: number) => {
			load(`/resources/sales?page=${page}`);
		},
		[load],
	);

	useEffect(() => {
		fetchSales(page);
	}, [fetchSales, page]);

	return {
		isLoading: state === "loading",
		sales: data?.sales,
		page,
	};
}
