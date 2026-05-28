export type UserAddress = {

  id: string;

  user_id: string;

  label: string;

  line1: string;

  street: string | null;

  street_number: string | null;

  address_notes: string | null;

  city: string;

  region: string;

  postal_code: string;

  country: string;

  is_default: boolean;

  created_at: string;

};



export type UserAddressInput = {

  label: string;

  line1: string;

  street?: string | null;

  street_number?: string | null;

  address_notes?: string | null;

  city: string;

  region: string;

  postal_code: string;

  country: string;

};

