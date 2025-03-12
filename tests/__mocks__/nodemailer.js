const nodemailer = jest.createMockFromModule('nodemailer');

nodemailer.createTransport = jest.fn().mockReturnValue({
  sendMail: jest.fn().mockResolvedValue({
    messageId: 'mock-message-id',
  }),
  verify: jest.fn().mockResolvedValue(true),
});

module.exports = nodemailer; 