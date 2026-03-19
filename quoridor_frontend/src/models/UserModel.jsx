// models/UserModel.js
export class UserModel {
    constructor({ id, name, email }) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    getDisplayName() {
        return this.name.toUpperCase();
    }
}