import * as kiwi from '@lume/kiwi';

class Variety {
    name: string
    tags: string[]
    constructor(name: string, tags: string[]){
        this.name = name;
        this.tags = tags;
    }
}

class Product {
    count: number
    variety: Variety
    constructor(variety: Variety, count: number){
        this.variety = variety;
        this.count = count
    }

}

class Allocation {
    variety : Variety
    finalCount: kiwi.Variable
    strength : kiwi.Strength
    constructor(variety:Variety){
        this.variety = variety
        this.finalCount = new kiwi.Variable()
        this.strength = kiwi.Strength.weak
    }

}

class Order {
    orderId:unknown
    requirements:Product[]
    preferences:Product[]
    allocations: Allocation[] = []
    constructor(orderId : unknown, requirements:Product[], preferences:Product[]) {
        this.orderId = orderId
        this.preferences = preferences
        this.requirements = requirements
    }
}


function distributeGoods(products: Product[], orders: Order[]) : void {
    const solver = new kiwi.Solver();

    for (const order of orders) {
        for (const pref of order.preferences) {
            const alloc = new Allocation(pref.variety)
            solver.addEditVariable(alloc.finalCount, alloc.strength as number)
            solver.suggestValue(alloc.finalCount, pref.count)
            order.allocations.push(alloc)
        }

        for (const req of order.requirements) {
            let alloc :Allocation
            if (order.allocations.some(a => a.variety === req.variety)) {
                // use existing
                alloc = order.allocations.filter(a => a.variety === req.variety)[0]
            } else {
                // create new allocation as if a preference
                alloc = new Allocation(req.variety)
                solver.addEditVariable(alloc.finalCount, alloc.strength as number)
                order.allocations.push(alloc)
            }
            // ensure that all REQUIRED orders are filled.
            solver.addConstraint(new kiwi.Constraint(new kiwi.Expression(alloc.finalCount), kiwi.Operator.Ge, req.count))
        }
        for (const alloc of order.allocations) {
            // ensure that all allocations are a positive number
            solver.addConstraint(new kiwi.Constraint(new kiwi.Expression(alloc.finalCount), kiwi.Operator.Ge))
        }
    }

    const progress : any = {}

    for (const product of products) {
        progress[product.variety.name] = new kiwi.Expression(0)
        for (const order of orders) {
            for (const alloc of order.allocations.filter(a => a.variety === product.variety)){
                progress[product.variety.name] = progress[product.variety.name].plus(alloc.finalCount)
            }
        }
        // ensure stock is not over allocated
        solver.addConstraint(new kiwi.Constraint(new kiwi.Expression(progress[product.variety.name]), kiwi.Operator.Le, product.count))
    }

    // Solve the constraints
    solver.updateVariables();
}

const fruit = new Variety("fruit", [])
const vege = new Variety("veg", [])
const fruitStock = new Product(fruit, 7)
const vegeStock = new Product(vege, 9)
const order1 = new Order("Jim", [new Product(fruit, 3), new Product(vege, 3)], [new Product(fruit, 5), new Product(vege, 5)])
const order2 = new Order("Ben", [new Product(fruit, 3), new Product(vege, 3)], [new Product(fruit, 5), new Product(vege, 5)])
distributeGoods([fruitStock, vegeStock], [order1, order2])
console.log( JSON.stringify(order1))
console.log( JSON.stringify(order2))