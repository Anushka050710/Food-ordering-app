import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user { id email name role country }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user { id email name role country }
    }
  }
`;

export const ME = gql`
  query Me {
    me { id email name role country }
  }
`;

export const GET_RESTAURANTS = gql`
  query GetRestaurants {
    restaurants {
      id name cuisine country imageUrl
      menuItems { id name description price category }
    }
  }
`;

export const GET_RESTAURANT = gql`
  query GetRestaurant($id: ID!) {
    restaurant(id: $id) {
      id name cuisine country imageUrl
      menuItems { id name description price category imageUrl }
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($restaurantId: ID!, $items: [OrderItemInput!]!) {
    createOrder(restaurantId: $restaurantId, items: $items) {
      id status totalAmount createdAt
      restaurant { id name }
      items { id quantity price menuItem { id name price } }
    }
  }
`;

export const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id status totalAmount createdAt
      restaurant { id name cuisine }
      items { id quantity price menuItem { id name } }
      user { id name email }
    }
  }
`;

export const CHECKOUT = gql`
  mutation Checkout($orderId: ID!, $paymentMethodId: ID!) {
    checkout(orderId: $orderId, paymentMethodId: $paymentMethodId) {
      id status totalAmount
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId: $orderId) {
      id status
    }
  }
`;

export const GET_PAYMENT_METHODS = gql`
  query GetPaymentMethods {
    paymentMethods { id type last4 expiryDate isDefault userId }
  }
`;

export const ADD_PAYMENT_METHOD = gql`
  mutation AddPaymentMethod($userId: ID!, $type: String!, $last4: String!, $expiryDate: String!, $isDefault: Boolean!) {
    addPaymentMethod(userId: $userId, type: $type, last4: $last4, expiryDate: $expiryDate, isDefault: $isDefault) {
      id type last4 expiryDate isDefault
    }
  }
`;

export const UPDATE_PAYMENT_METHOD = gql`
  mutation UpdatePaymentMethod($id: ID!, $type: String!, $last4: String!, $expiryDate: String!, $isDefault: Boolean!) {
    updatePaymentMethod(id: $id, type: $type, last4: $last4, expiryDate: $expiryDate, isDefault: $isDefault) {
      id type last4 expiryDate isDefault
    }
  }
`;

export const DELETE_PAYMENT_METHOD = gql`
  mutation DeletePaymentMethod($id: ID!) {
    deletePaymentMethod(id: $id) { id }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users { id name email role country }
  }
`;
