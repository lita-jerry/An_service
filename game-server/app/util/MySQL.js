  
  var fs = require('fs');
  var path = require('path')
  var mysql  = require('mysql');

  /**
   * 执行SQL语句
   * @param {String} sql 标准SQL语句 'UPDATE user SET name = ?'
   * @param {[String]} sqlparams SQL语句中?对应的值 ['name']
   * @param {(err, result)} callback err: 执行SQL的错误; result: 执行SQL完成的结果
   */
  var execute = function(sql, sqlparams, callback) {

    // var path = require("path")
    // app.loadConfig('mysql', path.resolve('./config/mysql.json'));
    // app.get('mysql')

    var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../config/mysql.json')));

    var pool = mysql.createPool(config.development);

    pool.getConnection(function(error, connection) {
      if (error || !connection) { callback('DBERROR: get connection.', null); }

      connection.query(sql, sqlparams, (err, result) => {
        connection.release();
        console.log('MySQL执行参数:------------------')
        console.log('sql:'+sql+'\n');
        console.log('sqlparams:'+sqlparams+'\n');
        console.log('MySQL执行结果:------------------')
        if (callback) {
          if (err) {
            console.log('err:'+err+'\n');
            callback(JSON.stringify(err), null);
          } else {
            console.log('result:'+JSON.stringify(result)+'\n');
            callback(null, result);
          }
        }
      })
    })
  };

  exports.execute = execute;