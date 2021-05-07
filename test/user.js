process.env.NODE_ENV = "test"
let chai = require('chai');
const db = require('../app/models');
let chaiHttp = require('chai-http');
let expect = chai.expect;
let server = require('../server');
let should = chai.should();


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
                truncate: {cascade: true}
            }),
            db.users.destroy({
                where: {},
                truncate: {cascade: true}
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
    
    let userId,token;
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
        token=body.data.accessToken;
        userId=body.data.user.id;
    })


    it('Login Fail if Wrong Username', async () => {

        const { status, body } = await chai.request(server)
            .post('/api/auth/signin')
            .send({
                userInput: 'user2',
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
        const {status} = await chai.request(server)
             .get('/api/user/'+ userId)
             .set('x-access-token',token);
         expect(status).to.eq(200);     
     })

     it('User Not Found: Get user by Id', async () => {
        const {status} = await chai.request(server)
             .get('/api/user/00000000-0000-0000-0000-000000000000')
             .set('x-access-token',token);
         expect(status).to.eq(404);     
     })

     it('Failed: Get user by Id (Invalid UUId)', async () => {
        const {status} = await chai.request(server)
             .get('/api/user/random')
             .set('x-access-token',token);
         expect(status).to.eq(500);     
     })

     it('Failed: Get user by Id (No token)', async () => {
        const {status, body} = await chai.request(server)
             .get('/api/user/'+userId);
         expect(status).to.eq(403);
         expect(body.metadata.message).to.equal('No token Provided');
     })

     it('Failed: Get user by Id (Invalid token)', async () => {
        const {status, body} = await chai.request(server)
             .get('/api/user/'+userId)
             .set('x-access-token','thisIsInvalidToken')
         expect(status).to.eq(401);
         expect(body.metadata.message).to.equal('Unauthorized!');
     })

     it('Edit user profile', async () => {
        const {status} = await chai.request(server)
             .put('/api/user/edit')
             .set('x-access-token',token)
             .send({
                firstName:'user3fname', 
                lastName:'user3lname',
             });
         expect(status).to.eq(200);
     })

     it('Failed: Edit user profile (Invalid input)', async () => {
        const {status} = await chai.request(server)
             .put('/api/user/edit')
             .set('x-access-token',token)
             .send({
                firstame:'user3fname' 
             });
         expect(status).to.eq(404);
     })

    it('Get all users', async () => {
       const {status} = await chai.request(server)
            .get('/api/users')
            .set('x-access-token',token);
        expect(status).to.eq(200);     
    })

})