export class Bid {
    _id: number;
    auction_id: number;
    bidder_id: number;
    time: string;
    amount: number;
    // -------------------
    name: string;
    current: number;
    ends: string;
}

export class Auction {
    _id: number;
    name: string;
    categories: any[];
    currently: number;
    first_bid: number;
    buy_price: number;
    number_of_bids: number;
    bids: Bid[];
    location: string;
    country: string;
    started: string;
    ends: string;
    seller_id: number;
    description: string;
}