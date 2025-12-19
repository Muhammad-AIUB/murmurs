-- Sample users
INSERT INTO users (name, email, createdAt, updatedAt) VALUES 
('Alice Johnson', 'alice@example.com', NOW(), NOW()),
('Bob Smith', 'bob@example.com', NOW(), NOW()),
('Charlie Brown', 'charlie@example.com', NOW(), NOW()),
('Diana Prince', 'diana@example.com', NOW(), NOW());

-- Sample murmurs
INSERT INTO murmurs (text, likeCount, userId, createdAt, updatedAt) VALUES 
('Hello world! This is my first murmur.', 5, 1, NOW(), NOW()),
('Beautiful day today!', 3, 1, NOW(), NOW()),
('Working on a new project with NestJS and React.', 8, 2, NOW(), NOW()),
('Just finished reading a great book.', 2, 2, NOW(), NOW()),
('Coffee is life ☕', 12, 3, NOW(), NOW()),
('Anyone interested in web development?', 4, 3, NOW(), NOW()),
('TypeScript is amazing!', 15, 4, NOW(), NOW()),
('Learning something new every day.', 6, 4, NOW(), NOW()),
('Good morning everyone!', 7, 1, NOW(), NOW()),
('What are you working on today?', 3, 2, NOW(), NOW());

-- Sample follows (users following each other)
INSERT INTO follows (followerId, followedId, createdAt) VALUES 
(1, 2, NOW()), -- Alice follows Bob
(1, 3, NOW()), -- Alice follows Charlie
(2, 1, NOW()), -- Bob follows Alice
(2, 3, NOW()), -- Bob follows Charlie
(2, 4, NOW()), -- Bob follows Diana
(3, 1, NOW()), -- Charlie follows Alice
(3, 4, NOW()), -- Charlie follows Diana
(4, 1, NOW()), -- Diana follows Alice
(4, 2, NOW()); -- Diana follows Bob

-- Sample likes
INSERT INTO likes (userId, murmurId, createdAt) VALUES 
(2, 1, NOW()), -- Bob likes Alice's murmur
(3, 1, NOW()), -- Charlie likes Alice's murmur
(4, 1, NOW()), -- Diana likes Alice's murmur
(1, 3, NOW()), -- Alice likes Bob's murmur
(3, 3, NOW()), -- Charlie likes Bob's murmur
(1, 5, NOW()), -- Alice likes Charlie's murmur
(2, 5, NOW()), -- Bob likes Charlie's murmur
(4, 5, NOW()); -- Diana likes Charlie's murmur
