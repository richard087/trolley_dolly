import test from 'ava';
import {Variety, Product, Order, distributeProductsToOrders} from "../src"


test('trivial', t => {
	const fruit = new Variety("fruit", [])
	const fruitStock = new Product(fruit, 7)
	const order1 = new Order("Jim", [], [new Product(fruit, 5)])
	distributeProductsToOrders([fruitStock], [order1])
	t.is(order1.allocations[0].finalCount.value(), 5)
})

test("full", t => {
	const fruit = new Variety("fruit", [])
	const vege = new Variety("veg", [])
	const fruitStock = new Product(fruit, 7)
	const vegeStock = new Product(vege, 9)
	const order1 = new Order("Jim", [new Product(fruit, 3), new Product(vege, 3)], [new Product(fruit, 5), new Product(vege, 5)])
	const order2 = new Order("Ben", [new Product(fruit, 3), new Product(vege, 3)], [new Product(fruit, 5), new Product(vege, 5)])
	const orders = [order1, order2]
	distributeProductsToOrders([fruitStock, vegeStock], orders )
	const fruitAlloc = orders.map( o => o.allocations.filter(a => a.variety === fruit)).flat()
	const vegesAlloc = orders.map( o => o.allocations.filter(a => a.variety === vege )).flat()
	const af : number = fruitAlloc.map(a => a.finalCount.value()).reduce((d, i) => d + i)
	const ef : number = fruitStock.count
	t.is(af, ef)
	const av : number = vegesAlloc.map(a => a.finalCount.value()).reduce((d, i) => d + i)
	const ev : number = vegeStock.count
	t.is(av, ev)
})

test("unsatisfiable", t => {
	const fruit = new Variety("fruit", [])
	const fruitStock = new Product(fruit, 4)
	const order1 = new Order("Jim", [new Product(fruit, 5)], [])
	const fnThrowsError = () => {
		distributeProductsToOrders([fruitStock], [order1])
		return false //should be unreachable
	}
	const err = t.throws( fnThrowsError , {instanceOf: Error, message : 'unsatisfiable constraint'})
})
