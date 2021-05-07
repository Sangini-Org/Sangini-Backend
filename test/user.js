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

    it('Get all users', async () => {

       const {status} = await chai.request(server)
            .get('/api/users');
        expect(status).to.eq(200);     
    })

})