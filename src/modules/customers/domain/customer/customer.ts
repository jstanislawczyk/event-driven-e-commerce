export class Customer {
  private constructor(
    readonly id: string,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
  ) {}

  static create(
    id: string,
    email: string,
    firstName: string,
    lastName: string,
  ): Customer {
    return new Customer(id, email, firstName, lastName);
  }
}
