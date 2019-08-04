export class Bid {
    _id: string;
    auction_id: string;
    bidder_id: string;
    time: string;
    amount: number;
    // -------------------
    name: string;
    current: number;
    ends: Date;
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
    started: boolean;
    seller_id: string;
    description: string;
    image: string;
    startingDate: Date;
    endingDate: Date;
    // startingDateString: string;
    // endingDateString: string;
}