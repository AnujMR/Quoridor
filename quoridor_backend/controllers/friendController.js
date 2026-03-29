const pool = require("../config/db");

// 1. Send a Friend Request
async function sendFriendRequest(senderId, receiverId) {
    if (senderId === receiverId) throw new Error("Cannot send request to yourself");

    const checkQuery = `
        SELECT * FROM friendships 
        WHERE (user_id1 = $1 AND user_id2 = $2) OR (user_id1 = $2 AND user_id2 = $1)
    `;
    const existing = await pool.query(checkQuery, [senderId, receiverId]);
    
    if (existing.rows.length > 0) {
        const relationship = existing.rows[0];
        
        if (relationship.status === 'pending') {
            throw new Error("Friend request already pending.");
        }
        if (relationship.status === 'accepted') {
            throw new Error("You are already friends.");
        }
        if (relationship.status === 'rejected') {
            // If it was rejected, we UPDATE it back to pending instead of inserting
            const updateQuery = `
                UPDATE friendships 
                SET status = 'pending', user_id1 = $1, user_id2 = $2, created_at = NOW()
                WHERE id = $3
                RETURNING *;
            `;
            // Notice we reset user_id1 to the NEW sender, just in case the person 
            // who previously rejected the request is now the one sending it!
            const result = await pool.query(updateQuery, [senderId, receiverId, relationship.id]);
            return result.rows[0];
        }
    }

    // If no row exists at all, do a standard insert
    const insertQuery = `
        INSERT INTO friendships (user_id1, user_id2, status, created_at)
        VALUES ($1, $2, 'pending', NOW())
        RETURNING *;
    `;
    const result = await pool.query(insertQuery, [senderId, receiverId]);
    return result.rows[0];
}

// 2. Accept a Friend Request
async function acceptFriendRequest(senderId, receiverId) {
    const updateQuery = `
        UPDATE friendships 
        SET status = 'accepted' 
        WHERE user_id1 = $1 AND user_id2 = $2 AND status = 'pending'
        RETURNING *;
    `;
    const result = await pool.query(updateQuery, [senderId, receiverId]);
    
    if (result.rows.length === 0) {
        throw new Error("Friend request not found or already accepted");
    }
    return result.rows[0];
}

// 3. Reject a Friend Request
async function rejectFriendRequest(senderId, receiverId) {
    const updateQuery = `
        UPDATE friendships 
        SET status = 'rejected' 
        WHERE user_id1 = $1 AND user_id2 = $2 AND status = 'pending'
        RETURNING *;
    `;
    const result = await pool.query(updateQuery, [senderId, receiverId]);
    
    if (result.rows.length === 0) {
        throw new Error("Friend request not found or already processed");
    }
    return { message: "Friend request rejected" };
}

// 4. Remove a Friend
async function removeFriend(user1, user2) {
    const deleteQuery = `
        DELETE FROM friendships 
        WHERE ((user_id1 = $1 AND user_id2 = $2) OR (user_id1 = $2 AND user_id2 = $1))
        AND status = 'accepted'
        RETURNING *;
    `;
    const result = await pool.query(deleteQuery, [user1, user2]);
    
    if (result.rows.length === 0) {
        throw new Error("Friendship not found");
    }
    return { message: "Friend removed successfully" };
}

// 5. Get a user's accepted friends list
async function getUserFriends(userId) {
    // We look for 'accepted' friendships where the user is either user_id1 or user_id2.
    // Then we JOIN with the users table to get the friend's actual data (name, rating, etc.)
    const query = `
        SELECT u.id, u.name, u.rating, u.profile, u.firebase_uid
        FROM users u
        JOIN friendships f ON (u.id = f.user_id1 OR u.id = f.user_id2)
        WHERE (f.user_id1 = $1 OR f.user_id2 = $1)
          AND u.id != $1
          AND f.status = 'accepted';
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
}

// 6. Get a user's pending received requests
async function getPendingRequests(userId) {
    // We only want requests where the user is the RECEIVER (user_id2) and status is 'pending'
    // We JOIN with the users table to get the SENDER'S data (user_id1)
    const query = `
        SELECT f.id as request_id, u.id as sender_id, u.name, u.rating, u.profile
        FROM users u
        JOIN friendships f ON u.id = f.user_id1
        WHERE f.user_id2 = $1 
          AND f.status = 'pending';
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
}

7. // Get a user's pending sent requests
async function getSentRequests(userId) {
    // We join with the users table to get the RECEIVER'S data (user_id2)
    const query = `
        SELECT f.id as request_id, u.id as receiver_id, u.name, u.rating, u.profile
        FROM users u
        JOIN friendships f ON u.id = f.user_id2
        WHERE f.user_id1 = $1 
          AND f.status = 'pending';
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
}

module.exports = {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getUserFriends,
    getPendingRequests,
    getSentRequests
};