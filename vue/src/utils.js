export default class utils {
  static months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec'];

  static days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Parses an ISO timestamp to a simpler form.
  static niceDate = (stamp, showTime) => {
    if (!stamp) {
      return '';
    }

    const d = new Date(stamp);
    let out = `${utils.days[d.getDay()]}, ${d.getDate()}`;
    out += ` ${utils.months[d.getMonth()]} ${d.getFullYear()}`;
    if (showTime) {
      out += ` ${d.getHours()}:${d.getMinutes()}`;
    }

    return out;
  };
}
