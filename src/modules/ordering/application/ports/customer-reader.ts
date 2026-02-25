export interface CustomerReader {
  exists(customerId: string): Promise<boolean>;
  findForReadModel(customerId: string): Promise<CustomerReadModel>;
}

export interface CustomerReadModel {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}
