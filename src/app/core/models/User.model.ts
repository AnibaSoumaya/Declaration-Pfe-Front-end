export class User {
    id?: number;
    email!: string;
    lastname!: string;
    firstname!: string;
    password?: string;
    tel!: string;
    role!: string;
    statutEmploi?: boolean;
    token?: string;
    firstLogin?: boolean;

}
