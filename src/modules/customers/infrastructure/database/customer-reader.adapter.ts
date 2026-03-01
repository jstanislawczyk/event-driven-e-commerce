import { Repository } from 'typeorm';
import type {
  CustomerReader,
  Customer,
} from '../../../ordering/application/ports/customer-reader.ts';
import type { CustomerEntity } from './entities/customer.entity.ts';

export class CustomerReaderAdapter implements CustomerReader {
  constructor(private readonly repository: Repository<CustomerEntity>) {}

  async exists(customerId: string): Promise<boolean> {
    return this.repository.exists({
      where: { id: customerId },
    });
  }

  async findById(customerId: string): Promise<Customer> {
    const customer = await this.repository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error(`Customer with ID ${customerId} not found.`);
    }

    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
    };
  }
}
