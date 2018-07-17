
/**
 * 执行SQL语句
 * @param {String} sql 标准SQL语句 'UPDATE user SET name = ?'
 * @param {[String]} sqlparams SQL语句中?对应的值 ['name']
 * @param {(err, result)} callback err: 执行SQL的错误; result: 执行SQL完成的结果
 */
var execute = function(sql, sqlparams, callback) {

    DBPool.getConnection(function(error, connection) {
        if (error || !connection) { callback('DBERROR: get connection.', null); }

        connection.query(sql, sqlparams, (err, result) => {
            connection.release();
            console.log('sql:'+sql+'\n');
            console.log('sqlparams:'+sqlparams+'\n');
            if (err) {
                console.log('err:'+err+'\n');
            }
            console.log('result:'+JSON.stringify(result)+'\n');
            if (callback) {
                if (err) {
                    callback(JSON.stringify(err), null);
                } else {
                    callback(null, result);
                }
            }
        })
    })
};

exports.execute = execute;