// "use client"

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from "lucide-react"
// import { FarmerNav } from "@/components/farmer-nav"
// import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// export default function AnalyticsPage() {
//   const salesData = [
//     { month: "Jan", revenue: 12400, orders: 45 },
//     { month: "Feb", revenue: 15600, orders: 52 },
//     { month: "Mar", revenue: 18900, orders: 61 },
//     { month: "Apr", revenue: 22300, orders: 68 },
//     { month: "May", revenue: 28700, orders: 79 },
//     { month: "Jun", revenue: 31200, orders: 85 },
//   ]

//   const productPerformance = [
//     { product: "Cow Milk", sales: 2850 },
//     { product: "Ghee", sales: 1920 },
//     { product: "Paneer", sales: 1560 },
//     { product: "Curd", sales: 1340 },
//     { product: "Butter", sales: 980 },
//   ]

//   return (
//     <div className="min-h-screen bg-background">
//       <FarmerNav />

//       <main className="container py-8 px-5">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//           <div>
//             <h1 className="text-4xl font-serif font-bold mb-2">Analytics</h1>
//             <p className="text-muted-foreground">Track your farm's performance and sales insights</p>
//           </div>
//           <Select defaultValue="6months">
//             <SelectTrigger className="w-full md:w-[180px]">
//               <SelectValue placeholder="Time period" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="7days">Last 7 Days</SelectItem>
//               <SelectItem value="30days">Last 30 Days</SelectItem>
//               <SelectItem value="3months">Last 3 Months</SelectItem>
//               <SelectItem value="6months">Last 6 Months</SelectItem>
//               <SelectItem value="1year">Last Year</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Key Metrics */}
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//               <DollarSign className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">₹1,29,100</div>
//               <div className="flex items-center text-xs text-primary mt-1">
//                 <TrendingUp className="h-3 w-3 mr-1" />
//                 <span>+18.2% from last period</span>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
//               <ShoppingCart className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">390</div>
//               <div className="flex items-center text-xs text-primary mt-1">
//                 <TrendingUp className="h-3 w-3 mr-1" />
//                 <span>+12.5% from last period</span>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
//               <Package className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">8,650</div>
//               <div className="flex items-center text-xs text-secondary mt-1">
//                 <TrendingDown className="h-3 w-3 mr-1" />
//                 <span>-3.1% from last period</span>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
//               <Users className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">127</div>
//               <div className="flex items-center text-xs text-primary mt-1">
//                 <TrendingUp className="h-3 w-3 mr-1" />
//                 <span>+8.4% from last period</span>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid gap-6 lg:grid-cols-2 mb-8">
//           {/* Revenue Chart */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Revenue Trend</CardTitle>
//               <CardDescription>Monthly revenue over the last 6 months</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ChartContainer
//                 config={{
//                   revenue: {
//                     label: "Revenue",
//                     color: "hsl(var(--primary))",
//                   },
//                 }}
//                 className="h-[300px]"
//               >
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={salesData}>
//                     <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
//                     <XAxis dataKey="month" className="text-xs" />
//                     <YAxis className="text-xs" />
//                     <ChartTooltip content={<ChartTooltipContent />} />
//                     <Line
//                       type="monotone"
//                       dataKey="revenue"
//                       stroke="hsl(var(--primary))"
//                       strokeWidth={2}
//                       dot={{ fill: "hsl(var(--primary))" }}
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </ChartContainer>
//             </CardContent>
//           </Card>

//           {/* Orders Chart */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Order Volume</CardTitle>
//               <CardDescription>Number of orders per month</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ChartContainer
//                 config={{
//                   orders: {
//                     label: "Orders",
//                     color: "hsl(var(--secondary))",
//                   },
//                 }}
//                 className="h-[300px]"
//               >
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={salesData}>
//                     <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
//                     <XAxis dataKey="month" className="text-xs" />
//                     <YAxis className="text-xs" />
//                     <ChartTooltip content={<ChartTooltipContent />} />
//                     <Bar dataKey="orders" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </ChartContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Product Performance */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Product Performance</CardTitle>
//             <CardDescription>Top selling products by revenue</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ChartContainer
//               config={{
//                 sales: {
//                   label: "Sales",
//                   color: "hsl(var(--primary))",
//                 },
//               }}
//               className="h-[300px]"
//             >
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={productPerformance} layout="vertical">
//                   <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
//                   <XAxis type="number" className="text-xs" />
//                   <YAxis dataKey="product" type="category" className="text-xs" width={100} />
//                   <ChartTooltip content={<ChartTooltipContent />} />
//                   <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </ChartContainer>
//           </CardContent>
//         </Card>
//       </main>
//     </div>
//   )
// }
