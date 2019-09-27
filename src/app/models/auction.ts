export class Bid {
    _id: string;
    auction_id: string;
    bidder_id: string;
    time: Date;
    amount: number;
    // -------------------
    name: string;
    username: string;
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
    location: {
        name: string;
        longitude: string;
        longtitude: string; //oh well
        latitude: string;
    };
    country: string;
    started: boolean;
    seller_id: string;
    description: string;
    photos: any[];
    startingDate: Date;
    endingDate: Date;
    // startingDateString: string;
    // endingDateString: string;
    bought: boolean;
    seller_display: string;
}