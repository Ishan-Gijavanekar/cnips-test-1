module.exports = function (req, res, config) {
    // Check if request method is PUT
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    // Access body parameters if needed
    const { id, newValue } = req.body;

    // API logic goes here
    if (!id || !newValue) {
        return res.status(400).json({ message: "Missing 'id' or 'newValue' parameter" });
    }

    // Simulate update logic
    return res.json({ message: `Resource with id ${id} updated to ${newValue}` });
}
