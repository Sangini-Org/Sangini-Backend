process.env.NODE_ENV = "test"
let chai = require('chai');
const db = require('../app/models');
let chaiHttp = require('chai-http');
let expect = chai.expect;
let server = require('../server');
let should = chai.should();
const fs = require('fs');

chai.use(chaiHttp);

describe("USERS API", () => {

    before(async () => {
        await db.sequelize.sync();
        await chai.request(server)
            .post('/api/auth/signup')
            .send({
                email: 'test12@gmail.com',
                password: 'test123',
                username: 'test12'
            });
    })
    // deleting existing record in sangini_test 
    after(async () => {
        await Promise.all([
            db.userImages.destroy({
                where: {},
                truncate: { cascade: true }
            }),
            db.users.destroy({
                where: {},
                truncate: { cascade: true }
            }),
            db.friendrequests.destroy({
                where: {},
                truncate: { cascade: true }
            }),
            db.userStatus.destroy({
                where: {},
                truncate: { cascade: true }
            })
        ])
    })

    it('Register a new user', async () => {

        let res = await chai.request(server)
            .post('/api/auth/signup')
            .send({
                email: 'user3@example.com',
                password: 'user3-pw',
                username: 'user3'
            });
        expect(res.status).to.eq(200);
        // expect(body.data.user.email).to.equal('user3@example.com')

    })

    it('Register a another user', async () => {
        let { status } = await chai.request(server)
            .post('/api/auth/signup')
            .send({
                email: 'user4@example.com',
                password: 'user4-pw',
                username: 'user4'
            });
        expect(status).to.eq(200);
     })
    
    let userId, token ;

    it('LogIn User', async () => {
        const { status, body } = await chai.request(server)
            .post('/api/auth/signin')
            .send({
                userInput: 'user3',
                password: 'user3-pw',
            });
        expect(status).to.eq(200);
        expect(body.data.user.username).to.equal('user3');
        expect(body.data.accessToken).to.exist;
        token = body.data.accessToken;
        userId = body.data.user.id;
    })

    it('Login Fail if Wrong Username', async () => {

        const { status, body } = await chai.request(server)
            .post('/api/auth/signin')
            .send({
                userInput: 'user34',
                password: 'pw',
            });
        expect(status).to.eq(404);
        expect(body.metadata.message).to.equal('User Not Found');
    })

    it('Login fail if wrong password', async () => {

        const { status, body } = await chai.request(server)
            .post('/api/auth/signin')
            .send({
                userInput: 'user3',
                password: 'pw-wro',
            });
        expect(status).to.eq(401);
        expect(body.metadata.message).to.equal('Invalid Password!')
    })

    it('Get user by Id', async () => {
        const { status } = await chai.request(server)
            .get('/api/user/' + userId)
            .set('x-access-token', token);
        expect(status).to.eq(200);
    })

    it('User Not Found: Get user by Id', async () => {
        const { status } = await chai.request(server)
            .get('/api/user/00000000-0000-0000-0000-000000000000')
            .set('x-access-token', token);
        expect(status).to.eq(404);
    })

    it('Failed: Get user by Id (Invalid UUId)', async () => {
        const { status } = await chai.request(server)
            .get('/api/user/random')
            .set('x-access-token', token);
        expect(status).to.eq(500);
    })

    it('Failed: Get user by Id (No token)', async () => {
        const { status, body } = await chai.request(server)
            .get('/api/user/' + userId);
        expect(status).to.eq(403);
        expect(body.metadata.message).to.equal('No token Provided');
    })

    it('Failed: Get user by Id (Invalid token)', async () => {
        const { status, body } = await chai.request(server)
            .get('/api/user/' + userId)
            .set('x-access-token', 'thisIsInvalidToken')
        expect(status).to.eq(401);
        expect(body.metadata.message).to.equal('Unauthorized!');
    })

    it('Edit user profile', async () => {
        const { status } = await chai.request(server)
            .put('/api/user/edit')
            .set('x-access-token', token)
            .send({
                firstName: 'user3fname',
                lastName: 'user3lname',
                city: 'delhi'
            });
        expect(status).to.eq(200);
    })

    it('Failed: Edit user profile (Invalid input)', async () => {
        const { status } = await chai.request(server)
            .put('/api/user/edit')
            .set('x-access-token', token)
            .send({
                firstame: 'user3fname'
            });
        expect(status).to.eq(404);
    })

    it('Get all users', async () => {
        const { status } = await chai.request(server)
            .get('/api/users')
            .set('x-access-token', token);
        expect(status).to.eq(200);
    })

    it('Get all users by Query', async () => {
        const { status } = await chai.request(server)
            .get('/api/users?city=delhi')
            .set('x-access-token', token);
        expect(status).to.eq(200);
    })

    it('Get all users (limit check)', async () => {
        const { status, body } = await chai.request(server)
            .get('/api/users?offlimit=2')
            .set('x-access-token', token);
        expect(status).to.eq(200);
        expect(body.data.users.length).to.eq(2);
    })

    describe("USERS IMAGE API", () => {
        let public_id;
        it('Upload Image', async () => {
            const { status, body } = await chai.request(server)
                .post('/api/user/image/upload')
                .set('x-access-token', token)
                .field({ type: 'profile' })
                .attach('image', fs.readFileSync(`${__dirname}/testImage.png`), 'tests/testImage.png');
            expect(status).to.eq(200);
            public_id = body.data;
        })

        it('Upload Image- Fail if nothing to upload', async () => {
            const { status, body } = await chai.request(server)
                .post('/api/user/image/upload')
                .set('x-access-token', token)
            expect(status).to.eq(500);
        })

        it('Get Image by Id', async () => {
            const { status } = await chai.request(server)
                .get('/api/user/' + userId + '/image')
                .set('x-access-token', token)
                .send({ type: 'profile' })
            expect(status).to.eq(200);
        })

        it('Get Image by Id -Fail if user not found', async () => {
            const { status } = await chai.request(server)
                .get('/api/user/00000000-0000-0000-0000-000000000000/image')
                .set('x-access-token', token)
            expect(status).to.eq(404);
        })

        it('Get Image by Id -Fail if userId Invalid', async () => {
            const { status } = await chai.request(server)
                .get('/api/user/random/image')
                .set('x-access-token', token)
            expect(status).to.eq(500);
        })


        it('Update Image', async () => {
            const { status } = await chai.request(server)
                .put('/api/user/image/update')
                .set('x-access-token', token)
                .field({ publicId: public_id })
                .attach('image', fs.readFileSync(`${__dirname}/testImage.png`), 'tests/testImage.png');
            expect(status).to.eq(200);
        })

        it('Update Image -Fail if file is not provided', async () => {
            const { status } = await chai.request(server)
                .put('/api/user/image/update')
                .set('x-access-token', token)
                .field({ publicId: public_id });
            expect(status).to.eq(500);
        })
        it('Delete Image', async () => {
            const { status } = await chai.request(server)
                .delete('/api/user/image/delete')
                .set('x-access-token', token)
                .send({ publicId: public_id });
            expect(status).to.eq(200);
        })

        it('Delete Image -Fail if public_id not provided', async () => {
            const { status } = await chai.request(server)
                .delete('/api/user/image/delete')
                .set('x-access-token', token)
            expect(status).to.eq(404);
        })
    })

    let userId2, token2;
    describe("FRIEND REQUEST API", () => {
        

        it('LogIn another User', async () => {
            const { status, body } = await chai.request(server)
                .post('/api/auth/signin')
                .send({
                    userInput: 'user3',
                    password: 'user3-pw',
                });
            expect(status).to.eq(200);
            expect(body.data.user.username).to.equal('user3');
            expect(body.data.accessToken).to.exist;
            token2 = body.data.accessToken;
            userId2 = body.data.user.id;
        })
     
        it('New friend request', async () => {
            const { status, body } = await chai.request(server)
                .post('/api/user/create/friendrequest')
                .set('x-access-token', token)
                .send({ id: userId2 })
            expect(status).to.eq(200);
            expect(body.data.status).to.eq(1);

        })

        it('New friend request - failed if no receiver id', async () => {
            const { status, body } = await chai.request(server)
                .post('/api/user/create/friendrequest')
                .set('x-access-token', token)
            expect(status).to.eq(404);

        })

        it('Get all friend requests for given status', async () => {
            const { status } = await chai.request(server)
                .get('/api/user/list/friendrequest?status=2')
                .set('x-access-token', token2);
            expect(status).to.eq(200);
        })

        it('Get all friend requests failed if no query', async () => {
            const { status } = await chai.request(server)
                .get('/api/user/list/friendrequest')
                .set('x-access-token', token2);
            expect(status).to.eq(404);
        })

        it('Accept/Update friend request', async () => {
            const { status ,body} = await chai.request(server)
                .put('/api/user/update/friendrequest')
                .set('x-access-token', token2)
                .send({ id: userId, status:'2' })
            expect(status).to.eq(200);
        })

        it('Update friend request -failed if no status is provided', async () => {
            const { status ,body} = await chai.request(server)
                .put('/api/user/update/friendrequest')
                .set('x-access-token', token2)
                .send({ id: userId })
            expect(status).to.eq(404);
        })

        it('Update friend request -failed if no senderid is provided', async () => {
            const { status ,body} = await chai.request(server)
                .put('/api/user/update/friendrequest')
                .set('x-access-token', token2)
                .send({ status:'2' });
            expect(status).to.eq(500);
        })
     
        it('Delete friend request', async () => {
            const { status } = await chai.request(server)
                .delete('/api/user/delete/friendrequest')
                .set('x-access-token', token2)
                .send({ id: userId });
            expect(status).to.eq(200);
        })

        it('Delete friend request -failed if no senderid', async () => {
            const { status } = await chai.request(server)
                .delete('/api/user/delete/friendrequest')
                .set('x-access-token', token2)
            expect(status).to.eq(404);
        })

    })

    describe("USER STATUS", () => {
        
     
        it('Add new status', async () => {
            const { status } = await chai.request(server)
                .post('/api/user/create/status')
                .set('x-access-token', token)
                .send({ 
                    trackId: '3cw4Y2ziYYiJV49bWN5H1D',
                    emoji: 'U+1F600',
                    songLine: 'Thinking out loud'
                 })
            expect(status).to.eq(200);

        })

        it('Add new status - failed if no token', async () => {
            const { status } = await chai.request(server)
                .post('/api/user/create/status')
                .send({ 
                    trackId: '3cw4Y2ziYYiJV49bWN5H1D',
                    emoji: 'U+1F600',
                    songLine: 'Thinking out loud'
                 })
            expect(status).to.eq(403);

        })

        it('Update status', async () => {
            const { status } = await chai.request(server)
                .put('/api/user/update/status')
                .set('x-access-token', token)
                .send({ 
                    trackId: '3cw4Y2ziYYiJV49bWN5H1D',
                    emoji: '❤️',
                    songLine: 'Thinking out loud'
                 })
            expect(status).to.eq(200);

        })

        it('Update status -Fail if no updating body ', async () => {
            const { status } = await chai.request(server)
                .put('/api/user/update/status')
                .set('x-access-token', token)
            expect(status).to.eq(404);
        })

        it('Add another status - to test getAllStatus', async () => {
            const { status } = await chai.request(server)
                .post('/api/user/create/status')
                .set('x-access-token', token2)
                .send({ 
                    trackId: '39LLxExYz6ewLAcYrzQQyP',
                    emoji: '🔥',
                    songLine: 'I got you, moonlight, you are my starlight'
                 })
            expect(status).to.eq(200);

        })

        it('Get user by Id', async () => {
            const { status } = await chai.request(server)
                .get('/api/user/'+userId2+'/status')
                .set('x-access-token', token2)
            expect(status).to.eq(200);

        })
        
        it('Get user by Id - Failed if invalid id', async () => {
            const { status } = await chai.request(server)
                .get('/api/user/IDisINVALID/status')
                .set('x-access-token', token2)
            expect(status).to.eq(500);

        })

        it('Get user by Id - if status not found', async () => {
            const { status } = await chai.request(server)
                .get('/api/user/00000000-0000-0000-0000-000000000000/status')
                .set('x-access-token', token2)
            expect(status).to.eq(404);

        })
  
        it('Get all  status', async () => {
            const { status ,body} = await chai.request(server)
                .get('/api/user/status/all')
                .set('x-access-token', token2);
            expect(status).to.eq(200);
            expect(body.metadata.message).to.equal('all status found ');
        })

        it('Get all  status by username query', async () => {
            const { status ,body} = await chai.request(server)
                .get('/api/user/status/all?user=username')
                .set('x-access-token', token2)
            expect(status).to.eq(200);
            expect(body.metadata.message).to.equal('all status found ');
        })
        
        it('Get all  status by username -blank array if no match', async () => {
            const { status ,body} = await chai.request(server)
                .get('/api/user/status/all?username=x')
                .set('x-access-token', token)
            expect(status).to.eq(200);
            expect(body.metadata.message).to.equal('user status not found by username');
        })

        it('Get all  status pagination query', async () => {
            const { status } = await chai.request(server)
                .get('/api/user/status/all?page=2&offlimit=1')
                .set('x-access-token', token2)
            expect(status).to.eq(200);
        })

        it('Get all  status -fail for over paginated query', async () => {
            const { status } = await chai.request(server)
                .get('/api/user/status/all?page=99999')
                .set('x-access-token', token2)
            expect(status).to.eq(404);
        })

        it('Like status', async () => {
            const { status ,body} = await chai.request(server)
                .put('/api/user/like/status')
                .set('x-access-token', token2)
                .send({ userId: userId })
            expect(status).to.eq(200);
            expect(body.metadata.message).to.equal('Status Liked');
        })

        it('Unlike status', async () => {
            const { status ,body} = await chai.request(server)
                .put('/api/user/like/status')
                .set('x-access-token', token2)
                .send({ userId: userId })
            expect(status).to.eq(200);
            expect(body.metadata.message).to.equal('Status Unliked');
        })

        it('Like/Unlike status -fail if no status', async () => {
            const { status ,body} = await chai.request(server)
                .put('/api/user/like/status')
                .set('x-access-token', token2)
                .send({userId: '00000000-0000-0000-0000-000000000000'})
            expect(status).to.eq(404);
        })
    })
})