import { db } from './schema'

export async function calculateTotalRevenue(): Promise<number> {
  try {
    const result = await db.order.aggregate({
      _sum: {
        total: true
      },
      where: {
        status: 'completed'
      }
    })
    return result._sum.total || 0
  } catch (error) {
    console.error('Error calculating total revenue:', error)
    return 0
  }
}

export async function countTotalOrders(): Promise<number> {
  try {
    return await db.order.count()
  } catch (error) {
    console.error('Error counting total orders:', error)
    return 0
  }
}

export async function countActiveProducts(): Promise<number> {
  try {
    return await db.product.count({
      where: {
        status: 'active'
      }
    })
  } catch (error) {
    console.error('Error counting active products:', error)
    return 0
  }
}

export async function countActiveCustomers(): Promise<number> {
  try {
    return await db.user.count({
      where: {
        status: 'active'
      }
    })
  } catch (error) {
    console.error('Error counting active customers:', error)
    return 0
  }
}

export async function calculateRevenueChange(lastMonth: Date): Promise<number> {
  try {
    const currentRevenue = await db.order.aggregate({
      _sum: {
        total: true
      },
      where: {
        status: 'completed',
        createdAt: {
          gte: lastMonth
        }
      }
    })

    const previousRevenue = await db.order.aggregate({
      _sum: {
        total: true
      },
      where: {
        status: 'completed',
        createdAt: {
          lt: lastMonth,
          gte: new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    const current = currentRevenue._sum.total || 0
    const previous = previousRevenue._sum.total || 0

    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  } catch (error) {
    console.error('Error calculating revenue change:', error)
    return 0
  }
}

export async function calculateOrdersChange(lastMonth: Date): Promise<number> {
  try {
    const currentOrders = await db.order.count({
      where: {
        createdAt: {
          gte: lastMonth
        }
      }
    })

    const previousOrders = await db.order.count({
      where: {
        createdAt: {
          lt: lastMonth,
          gte: new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    if (previousOrders === 0) return 0
    return ((currentOrders - previousOrders) / previousOrders) * 100
  } catch (error) {
    console.error('Error calculating orders change:', error)
    return 0
  }
}

export async function calculateProductsChange(lastMonth: Date): Promise<number> {
  try {
    const currentProducts = await db.product.count({
      where: {
        status: 'active',
        createdAt: {
          gte: lastMonth
        }
      }
    })

    const previousProducts = await db.product.count({
      where: {
        status: 'active',
        createdAt: {
          lt: lastMonth,
          gte: new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    if (previousProducts === 0) return 0
    return ((currentProducts - previousProducts) / previousProducts) * 100
  } catch (error) {
    console.error('Error calculating products change:', error)
    return 0
  }
}

export async function calculateCustomersChange(lastMonth: Date): Promise<number> {
  try {
    const currentCustomers = await db.user.count({
      where: {
        status: 'active',
        createdAt: {
          gte: lastMonth
        }
      }
    })

    const previousCustomers = await db.user.count({
      where: {
        status: 'active',
        createdAt: {
          lt: lastMonth,
          gte: new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    if (previousCustomers === 0) return 0
    return ((currentCustomers - previousCustomers) / previousCustomers) * 100
  } catch (error) {
    console.error('Error calculating customers change:', error)
    return 0
  }
}

export async function generateChartData(): Promise<Array<{ name: string; total: number }>> {
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentYear = new Date().getFullYear()
    
    const monthlyRevenue = await Promise.all(
      months.map(async (month, index) => {
        const startDate = new Date(currentYear, index, 1)
        const endDate = new Date(currentYear, index + 1, 0)

        const result = await db.order.aggregate({
          _sum: {
            total: true
          },
          where: {
            status: 'completed',
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        })

        return {
          name: month,
          total: result._sum.total || 0
        }
      })
    )

    return monthlyRevenue
  } catch (error) {
    console.error('Error generating chart data:', error)
    return []
  }
}