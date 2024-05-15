import { Injectable } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { Cart, CartItem, StatusCart } from '../models';
import { db, Database } from 'src/db/db-instance';

@Injectable()
export class CartService {
  private userCarts: Record<string, Cart> = {};
  private db: Database;

  constructor() {
    this.db = db;
  }

  async findByUserId(userId: string): Promise<Cart> {
    const dbClient = await this.db.getClient();

    try {

      if (!userId) return null;

      const query = `SELECT ci.*
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE c.user_id = '${userId}'`;
      const { rows } = await dbClient.query(query);

      if (rows.length) {
        return {
          id: rows[0].cart_id,
          items: rows.map(row => ({ product: { id: row.product_id }, count: row.count })),
        }
      } else {
        return null;
      }

    } catch (error) {
      await dbClient.query('ROLLBACK');
      console.log(error);
    } finally {
      dbClient.release();
    }

  }

  async createByUserId(userId: string): Promise<Cart> {
    const id = userId ?? uuidv4();
    const dbClient = await this.db.getClient();

    try {
      const query = `INSERT INTO carts (user_id, created_at, updated_at, status)
      VALUES ('${id}', '${this.getCurrentDate()}', '${this.getCurrentDate()}',
      '${StatusCart.Open}') RETURNING id`;

      const { rows } = await dbClient.query(query);
      const cart = {
        id: rows[0].id,
        items: [],
      }
      return cart;
    } catch (error) {
      await dbClient.query('ROLLBACK');
      console.log(error);
    } finally {
      dbClient.release();
    }
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return await this.createByUserId(userId);
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    const cart: Cart = await this.findOrCreateByUserId(userId);

    const dbClient = await this.db.getClient();

    try {
      items.forEach(async (item: CartItem) => {
        const query = `UPDATE cart_items SET count=${item.count} WHERE
          cart_id='${cart.id}' AND product_id='${item.product.id}'`;

        await dbClient.query(query);
      });

      const cartItemsByCartIdRequest = `SELECT * from cart_items WHERE cart_id = '${cart.id}'`;
      const { rows } = await dbClient.query(cartItemsByCartIdRequest);

      return {
        id: cart.id,
        items: rows.map(row => ({ product: { id: row.product_id },  count: row.count }))
      }

    } catch (error) {
      await dbClient.query('ROLLBACK');
      console.log(error);
    } finally {
      dbClient.release();
    }
  }

  async removeByUserId(userId): Promise<void> {
    const dbClient = await this.db.getClient();

    try {
      const query = `DELETE FROM cart_items
        WHERE cart_id IN (SELECT id FROM carts WHERE user_id = '${userId}');
        DELETE FROM carts
        WHERE user_id = '${userId}';`
     await dbClient.query(query);

    } catch (error) {
      await dbClient.query('ROLLBACK');
    } finally {
      dbClient.release()
    }
  }

  private getCurrentDate(): string {
    let yourDate = new Date()
    const offset = yourDate.getTimezoneOffset()
    yourDate = new Date(yourDate.getTime() - (offset*60*1000))
    return yourDate.toISOString().split('T')[0]
  }

}
