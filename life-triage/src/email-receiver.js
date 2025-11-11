import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { EventEmitter } from 'events';

export class EmailReceiver extends EventEmitter {
  constructor() {
    super();
    this.imap = null;
    this.stats = {
      received: 0,
      processed: 0,
      errors: 0
    };
  }

  async start() {
    const config = {
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      tls: process.env.EMAIL_TLS === 'true',
      tlsOptions: { rejectUnauthorized: false }
    };

    this.imap = new Imap(config);

    this.imap.once('ready', () => {
      console.log('✅ IMAP connection ready');
      this.openInbox();
    });

    this.imap.on('mail', () => {
      console.log('📬 New mail arrived');
      this.fetchNewMails();
    });

    this.imap.on('error', (err) => {
      console.error('❌ IMAP error:', err);
      this.stats.errors++;
    });

    this.imap.on('end', () => {
      console.log('📭 IMAP connection ended');
    });

    this.imap.connect();
  }

  openInbox() {
    this.imap.openBox('INBOX', false, (err) => {
      if (err) {
        console.error('❌ Error opening inbox:', err);
        return;
      }
      console.log('📂 Inbox opened');
      this.fetchNewMails();
    });
  }

  fetchNewMails() {
    this.imap.search(['UNSEEN'], (err, results) => {
      if (err) {
        console.error('❌ Error searching emails:', err);
        return;
      }

      if (!results || results.length === 0) {
        console.log('📪 No new emails');
        return;
      }

      console.log(`📨 Found ${results.length} new email(s)`);

      const fetch = this.imap.fetch(results, {
        bodies: '',
        markSeen: true
      });

      fetch.on('message', (msg) => {
        msg.on('body', (stream) => {
          simpleParser(stream, async (err, parsed) => {
            if (err) {
              console.error('❌ Error parsing email:', err);
              return;
            }

            this.stats.received++;

            const email = {
              from: parsed.from?.text,
              to: parsed.to?.text,
              subject: parsed.subject,
              text: parsed.text,
              html: parsed.html,
              date: parsed.date,
              attachments: parsed.attachments?.map(att => ({
                filename: att.filename,
                contentType: att.contentType,
                size: att.size,
                content: att.content
              })) || []
            };

            this.emit('email', email);
            this.stats.processed++;
          });
        });
      });

      fetch.once('error', (err) => {
        console.error('❌ Fetch error:', err);
        this.stats.errors++;
      });
    });
  }

  async stop() {
    if (this.imap) {
      this.imap.end();
    }
  }

  async getStats() {
    return this.stats;
  }
}
