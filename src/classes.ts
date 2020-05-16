export class User{
    userId: number;//:  number, // primary key
    username: string;//: string, // not null, unique
    password?: string;//: string, // not null
    firstName: string;//: string, // not null
    lastName: string;//: string, // not null
    email: string;//: string, // not null
    role: string;
    constructor(userid: number,username: string,firstName: string,lastName: string,email: string,role: string){
        this.userId=userid;//:  number, // primary key
        this.username=username;//: string, // not null, unique
        //this.password=password;//: string, // not null
        this.firstName=firstName;//: string, // not null
        this.lastName=lastName;//: string, // not null
        this.email=email;//: string, // not null
        this.role=role;//: Role // not null
    }
    roleId() {
        switch(this.role) {
            case "Admin":
                return 1;
            case "Manager":
                return 2;
            case "Employee":
                return 3;
            default:
                return 3;
        }
    }
};
export class Role{
    role: string;
    roleId: number;
    constructor(roleId: number, role: string){
        this.roleId=roleId;
        this.role=role;
    }
}

export class Reim{
    reimbursementId: number;//: number, // primary key
    author: number;//: number,  // foreign key -> User, not null
    amount: number;//: number,  // not null
    dateSubmitted: Date;//: number, // not null
    dateResolved?: Date;//: number, // not null
    description: string;//: string, // not null
    resolver: number;//: number, // foreign key -> User
    status: string;//: number, // foreign ey -> ReimbursementStatus, not null
    type: string;//: number // foreign key -> ReimbursementType
    constructor(reimbursementId:number,author:number,amount:number,dateSubmitted: Date,description: string,resolver: number,status: string,type: string,dateResolved?:Date){
        this.reimbursementId=reimbursementId;//: number, // primary key
        this.author=author;//: number,  // foreign key -> User, not null
        this.amount=amount;//: number,  // not null
        this.dateSubmitted=dateSubmitted;//: number, // not null
        this.dateResolved=dateResolved;//: number, // not null
        this.description=description;//: string, // not null
        this.resolver=resolver;//: number, // foreign key -> User
        this.status=status;//: number, // foreign ey -> ReimbursementStatus, not null
        this.type=type;//: number // foreign key -> ReimbursementType
    }
    statusId() {
        switch(this.status) {
            case "Approved":
                return 1;
            case "Denied":
                return 2;
            case "Pending":
                return 3;
            default:
                return 3;
        }
    }
    typeId() 
        {switch(this.type) {
            case "Lodging":
                return 1;
            case "Food":
                return 2;
            case "Travel":
                return 3;
            case "Other":
                return 4;
            default:
                return 4;
        }
    }
};
export class ReimType{
    type: string;
    typeId: number;
    constructor(typeId: number, type: string){
        this.typeId=typeId;
        this.type=type;
    }
}
export class ReimStatus{
    status: string;
    statusId: number;
    constructor(statusId: number, status: string){
        this.statusId=statusId;
        this.status=status;
    }
}