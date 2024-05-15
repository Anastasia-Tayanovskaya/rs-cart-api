import { Cart, CartItem } from '../models';

/**
 * @param {Cart} cart
 * @returns {number}
 */
export function calculateCartTotal(cart: Cart): number {
  const min: number = 10;
  const max: number = 40;
  return cart ? cart.items?.reduce((acc: number, { product: { price }, count }: CartItem) => {
    const randomPrice = Math.floor(Math.random() * (max - min + 1)) + min;
    return acc += randomPrice * count;
  }, 0) : 0;
}
