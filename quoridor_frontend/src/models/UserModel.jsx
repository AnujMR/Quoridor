// models/UserModel.js
export class UserModel {
    constructor({ id, name, email, rating, firebase_uid, created_at, profile }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.firebase_uid = firebase_uid;
        this.rating = rating;
        this.profile = profile;
        this.created_at = new Date(created_at);
    }

    getDisplayName() {
        return this.name.toUpperCase();
    }
}