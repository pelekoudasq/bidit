export class Bid {
    _id: string;
    auction_id: string;
    bidder_id: string;
    time: string;
    amount: number;
    // -------------------
    name: string;
    current: number;
    ends: string;
}

export class Auction {
    _id: string;
    name: string;
    categories: any[];
    currently: number;
    first_bid: number;
    buy_price: number;
    number_of_bids: number;
    bids: string[];
    location: string;
    country: string;
    started: string;
    ends: string;
    seller_id: string;
    description: string;
}