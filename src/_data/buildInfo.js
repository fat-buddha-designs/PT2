module.exports = () => {
    const now = new Date();
    const timeZone = 'GMT';
    const buildTime = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone,
    }).format(now);

    return {
      time: {
        raw: now.toISOString(),
        formatted: `${buildTime} ${timeZone}`,
    }
  }
}