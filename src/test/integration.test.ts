import app from '../app';
import request from 'supertest';

let token: string = null;
beforeAll(async () => {
  const tokenRes = await request(app)
    .post('/api/v1/user/signin/')
    .send({
      username: 'admin',
      password: 'password123admin',
    });

  token = tokenRes.body.token;
});

describe('Get ping Endpoints', () => {
  it('should return the version of the api', async () => {
    const res = await request(app).get('/api/v1/');
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty('message');
  });
});

describe('Get flights Endpoints', () => {
  it('should return status 401 unauthorize', async () => {
    const res = await request(app).get('/api/v1/flights/');
    expect(res.status).toEqual(401);
  });
  it('should return status 200 after authorization', async () => {
    const res = await request(app)
      .get('/api/v1/flights?departure_airport=CDG&arrival_airport=LHR&departure_date=2019-03-28&tripType=OW')
      .set('Authorization', `${token}`);

    expect(res.status).toEqual(200);
  });
  it(`should return status 404 with message 'departureAirport not found'`, async () => {
    const res = await request(app)
      .get('/api/v1/flights?arrival_airport=LHR&departure_date=2019-03-28&tripType=OW')
      .set('Authorization', `${token}`);

    expect(res.status).toEqual(404);
    expect(res.body.message).toEqual('departureAirport not found');
  });
  it(`should return status 404 with message 'arrivalAirport not found'`, async () => {
    const res = await request(app)
      .get('/api/v1/flights?departure_airport=CDG&departure_date=2019-03-28&tripType=OW')
      .set('Authorization', `${token}`);

    expect(res.status).toEqual(404);
    expect(res.body.message).toEqual('arrivalAirport not found');
  });
  it(`should return status 404 with message 'departureDate not found'`, async () => {
    const res = await request(app)
      .get('/api/v1/flights?arrival_airport=LHR&departure_airport=CDG&tripType=OW')
      .set('Authorization', `${token}`);

    expect(res.status).toEqual(404);
    expect(res.body.message).toEqual('departureDate not found');
  });
  it(`should return status 404 with message 'tripType not found'`, async () => {
    const res = await request(app)
      .get('/api/v1/flights?departure_date=2019-03-28&arrival_airport=LHR&departure_airport=CDG')
      .set('Authorization', `${token}`);

    expect(res.status).toEqual(404);
    expect(res.body.message).toEqual('tripType not found');
  });
  it(`should return status 400 with message 'Invalid date departureDate'`, async () => {
    const res = await request(app)
      .get('/api/v1/flights?departure_airport=CDG&departure_date=2019-03-2sd8&arrival_airport=LHR&tripType=OW')
      .set('Authorization', `${token}`);

    expect(res.status).toEqual(400);
    expect(res.body.message).toEqual(`Invalid date 'departureDate'`);
  });
  it(`should return status 400 with message TripType must be equals to 'R' or 'OW'`, async () => {
    const res = await request(app)
      .get('/api/v1/flights?departure_airport=CDG&departure_date=2019-03-28&arrival_airport=LHR&tripType=OWD')
      .set('Authorization', `${token}`);

    expect(res.status).toEqual(400);
    expect(res.body.message).toEqual(`TripType must be equals to 'R' or 'OW'`);
  });
  it(`should return status 400 if tripType = 'R' and return_date is not set`, async () => {
    const res = await request(app)
      .get('/api/v1/flights?departure_airport=CDG&departure_date=2019-03-28&arrival_airport=LHR&tripType=R')
      .set('Authorization', `${token}`);

    expect(res.status).toEqual(400);
    expect(res.body.message).toEqual(`When tripType is equald to 'R' then returnDate is mandatory`);
  });
  it(`should return status 400 if return_date is not valid`, async () => {
    const res = await request(app)
      .get(
        '/api/v1/flights?departure_airport=CDG&departure_date=2019-03-28&arrival_airport=LHR&return_date=20sd19-03-28&tripType=R',
      )
      .set('Authorization', `${token}`);

    expect(res.status).toEqual(400);
    expect(res.body.message).toEqual(`Invalid date 'returnDate'`);
  });
  it(`should return status 400 if return_date is before departur_date`, async () => {
    const res = await request(app)
      .get(
        '/api/v1/flights?departure_airport=CDG&departure_date=2019-03-28&arrival_airport=LHR&return_date=2019-03-25&tripType=R',
      )
      .set('Authorization', `${token}`);

    expect(res.status).toEqual(400);
    expect(res.body.message).toEqual(
      `The date ${new Date('2019-03-25').toISOString()} must be higher than ${new Date('2019-03-28').toISOString()}`,
    );
  });
});

describe('Post signin Endpoints', () => {
  it('should return the token of the user', async () => {
    const res = await request(app)
      .post('/api/v1/user/signin/')
      .send({
        username: 'admin',
        password: 'password123admin',
      });
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
