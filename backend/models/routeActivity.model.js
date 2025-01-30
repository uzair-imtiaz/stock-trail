// RouteActivity Table (Manages Daily Routes + Inventory Dropping + Sales)

// routeId (Reference to Routes) – The predefined route.
// date (Date) – The date of this route's execution.
// status (Enum: Pending, In Progress, Completed) – Status of the route.
// deliveryPersonId (Reference to Users) – The person handling deliveries.
// inventoryDropped (Array of Objects):
// shopId (Reference to Shops) – The shop where items were dropped.
// items (Array of Objects) – { itemId, quantityDropped, itemPrice }.
// collectedAmount (Number) – Amount collected for the dropped items.
// tpr - Pieces given for free.
// expenses - Expenses incurred during the route.
// totalAmount - Total amount collected from the route.
// profit - Profit from the route.
// creditAmount - Amount given on credit.
