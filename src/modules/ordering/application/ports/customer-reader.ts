export interface CustomerReader {
  exists(customerId: string): Promise<boolean>;
  findById(customerId: string): Promise<Customer>;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}
